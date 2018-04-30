const EpisodeInfoApi = require("./EpisodeInfoApi")
const Episode = require("./Episode")
const _ = require('lodash')
const Notifier = require("./Notifier")
const ShowRepository = require("./ShowRepository")
const RedisRepository = require("./RedisRepository")


const config = require("../config.js")
const fetch = require("node-fetch")
const FloodDownloader = require("./FloodDownloader")
const scraper = require('torrent-scrape')

const checkForNewEpisodes = async () => {
    console.log("Initiating check for episodes airing today.")

    const repository = new ShowRepository()
    const redis = new RedisRepository()
    const tvApi = new EpisodeInfoApi()
    const notifier = new Notifier(config.pushbulletToken)

    try {
        const trackedShows = repository.getAllTrackedShows()
        
        const devices = await notifier.getDevices()
        await tvApi.authenticate(config.apikey, config.username, config.userkey)

        const tvDbShows = (await Promise.all(trackedShows.map(async show => tvApi.getShowInfo(show.id))))
        const episodes = await Promise.all(tvDbShows.map(async show => (await tvApi.getEpisodes(show.data.id)).data.map(json => Episode.fromJson(json, show.data.id, show.data.seriesName, show.data.airsTime))))
        const episodes_flattened = _.flatten(episodes)

        const airingToday = _.flatten(episodes).filter(episode => episode.justAired(config.notificationDelayHours))

        // Notify devices of new episodes
        await Promise.all(airingToday.map(episode => notifier.notify(devices, episode.getAiredString(config.localTimezone), "")))
        console.log('Devices notified.')
        
        const needsDownload = airingToday.filter(episode => !repository.getAvailableForStreaming(episode.showId))
        
        console.log(`Found ${airingToday.length} new episodes, ${needsDownload.length} of which are not available for streaming...`)
        // Put all new episodes on the queue
        await Promise.all(needsDownload.map(async episode => {
            console.log(`Queuing ${episode.showName}, season ${episode.season}, episode ${episode.episodeNumber}...`)
            return redis.appendToQueue(episode)
        }))

        // Open connection to Flood
        const queueLength = await redis.getQueueLength()
        const flood = await FloodDownloader.create(config.floodUrl, config.floodUsername, config.floodPassword)
        // Attempt to retreive torrents for all pending downloads
        for(let i = 0; i < queueLength; i++) {
            const episode = Episode.fromRedisFields(await redis.popFromQueue())
            const torrents = await getTorrents(episode)
            if(torrents.length === 0 || torrents[0].seeders < config.minSeeders) {
                redis.appendToQueue(episode)
            } else {
                console.log(`Requesting download for ${episode.showName}, season ${episode.season}, episode ${episode.episodeNumber}...`)
                const response = await flood.requestDownload(torrents[0].magnetLink)
                if(response.status !== 200) {
                    console.log(`Could not start download for ${episode.showName}, season ${episode.season}, episode ${episode.episodeNumber}, putting back on queue...`)
                    redis.appendToQueue(episode)
                } else {
                    console.log(`Download started for ${episode.showName}, season ${episode.season}, episode ${episode.episodeNumber}...`)
                }
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        redis.client.quit()
    }
}

const getTorrents = async episode => {
    return scraper.performShowSearch(episode.showName, episode.season, episode.episodeNumber)
        .then(torrents => torrents.filter(torrent => torrent.hasResolution('1080p')))
        .then(torrents => torrents.sort((a, b) => Number(a.seeders) < Number(b.seeders)))
} 

checkForNewEpisodes()
