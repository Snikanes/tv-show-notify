const EpisodeInfoApi = require("./EpisodeInfoApi")
const Episode = require("./Episode")
const _ = require('lodash')
const Notifier = require("./Notifier")

module.exports = async function(context) {
    try {
        const showBlob = context.bindings.tvshows
        const prefs = context.bindings.prefconfig
        
        const tvApi = new EpisodeInfoApi()
        const notifier = new Notifier(prefs.pushbulletToken)

        const devices = await notifier.getDevices()
        await tvApi.authenticate(prefs.apikey, prefs.username, prefs.userkey)

        const episodes = await Promise.all(showBlob.tvshows.map(async show => (await tvApi.getEpisodes(show.id)).data.map(json => Episode.fromJson(json, show.id, show.name))))
        const airingToday = _.flatten(episodes).filter(episode => episode.didAirToday())
        
        devices.forEach(device => airingToday.forEach(episode => notifier.notify(device, episode.getAiredString(), "")))
    } catch(error) {
        context.error(error)
    } finally {
        context.done()
    }
}