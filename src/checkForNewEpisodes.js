const EpisodeInfoApi = require("./EpisodeInfoApi")
const Episode = require("./Episode")
const _ = require('lodash')
const Notifier = require("./Notifier")
const Repository = require("./Repository")
const prefs = require("../prefconfig.json")
const fetch = require("node-fetch")
const alreadyShows = require("../tvshows.json")

const heckForNewEpisodes = async () => {
    console.log("Initiating check for episodes airing today.")
    const local_timezone = "Europe/Oslo"
    const notification_delay_hours = 10

    try {
        const repository = new Repository()
        const tvApi = new EpisodeInfoApi()
        const notifier = new Notifier(prefs.pushbulletToken)

        const trackedShows = repository.getAllTrackedShows()
        console.log(trackedShows)
        const devices = await notifier.getDevices()
        await tvApi.authenticate(prefs.apikey, prefs.username, prefs.userkey)

        const tvDbShows = (await Promise.all(trackedShows.map(async show => tvApi.getShowInfo(show.id))))
        const episodes = await Promise.all(tvDbShows.map(async show => (await tvApi.getEpisodes(show.data.id)).data.map(json => Episode.fromJson(json, show.data.id, show.data.seriesName, show.data.airsTime))))
        const episodes_flattened = _.flatten(episodes)

        const airingToday = _.flatten(episodes).filter(episode => episode.justAired(notification_delay_hours))

        // Notify devices of new episodes
        //await Promise.all(airingToday.map(episode => notifier.notify(devices, episode.getAiredString(local_timezone), "")))

        const needsDownload = airingToday.filter(episode => !repository.getAvailableForStreaming(episode.showId))
        
        // Notify torrent downloader
        await Promise.all(needsDownload.map(episode => fetch("www.example.com", {
            method: "POST",
            body: { "episodes": needsDownload }
        }.then(response => {
            if(response.status !== 200) {
                console.error("Could not notify torrent downloader.")
            } else {
                console.log("Notified downloads.")
            }
        }))))

        console.log('Devices notified.')

    } catch (error) {
        console.error(error)
    }
}

checkForNewEpisodes()