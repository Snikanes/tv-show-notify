const EpisodeInfoApi = require("./EpisodeInfoApi")
const Episode = require("./Episode")
const _ = require('lodash')
const Notifier = require("./Notifier")

module.exports = async function(context) {
    context.log("Initiating check for episodes airing today.")
    const local_timezone = "Europe/London"
    const notification_delay_hours = 10

    try {
        const showBlob = context.bindings.tvshows
        const prefs = context.bindings.prefconfig
        
        const tvApi = new EpisodeInfoApi()
        const notifier = new Notifier(prefs.pushbulletToken)

        const devices = await notifier.getDevices()
        await tvApi.authenticate(prefs.apikey, prefs.username, prefs.userkey)

        const shows = (await Promise.all(showBlob.tvshows.map(async show => tvApi.getShowInfo(show.id))))
        const episodes = await Promise.all(shows.map(async show => (await tvApi.getEpisodes(show.data.id)).data.map(json => Episode.fromJson(json, show.data.id, show.data.showId, show.data.airsTime))))
        const episodes_flattened = _.flatten(episodes)
        
        const airingToday = _.flatten(episodes).filter(episode => episode.justAired(notification_delay_hours))
        context.log(`${airingToday.length} episodes just aired.`)

        await Promise.all(airingToday.map(episode => notifier.notify(devices, episode.getAiredString(local_timezone), "")))
        context.log('Devices notified.')
    } catch(error) {
        context.error(error)
    } finally {
        context.done()
    }
}