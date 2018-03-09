const EpisodeInfoApi = require("./EpisodeInfoApi")
const Episode = require("./Episode")
const _ = require('lodash')
const Notifier = require("./Notifier")

module.exports = function(context) {
    const showBlob = context.bindings.tvshows
    const prefs = context.bindings.prefconfig
    
    const tvApi = new EpisodeInfoApi()
    const notifier = new Notifier()

    const devices = notifier.getDevices()
    const episodes = tvApi.authenticate().then(() => {
        return Promise.all(showBlob.tvshows.map(show => tvApi.getEpisodes(show.id)))
    }).then(shows => {
        return shows.map((show, index) => show.data.map(json => Episode.fromJson(json, showBlob.tvshows[index].id, showBlob.tvshows[index].name)))
    }).then(episodes => _.flatten(episodes).filter(episode => episode.didAirToday()))

    return Promise.all([devices, episodes]).then(([devices, episodes]) => {
        devices.forEach(device => episodes.forEach(episode => notifier.notify(device, episode.getAiredString(), "")))
    }).then(() => {
        context.done()
    }).catch(error => {
        console.error(error)
        context.done()
    })
}