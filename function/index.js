const EpisodeInfoApi = require("./EpisodeInfoApi")
const Episode = require("./Episode")
const Notifier = require("./Notifier")

module.exports = async function(context) {
    try {
        const showBlob = context.bindings.tvshows
        const prefs = context.bindings.prefconfig
        
        const tvApi = new EpisodeInfoApi()
        await tvApi.authenticate()

        const notifier = new Notifier()
        const devices = await notifier.getDevices()
        
        showBlob.tvshows.forEach(async show => {
            const episodes = (await tvApi.getEpisodes(show.id)).data.map(json => Episode.fromJson(json, show.id, show.name))
            episodes.forEach(episode => {
                if(episode.didAirToday()) {
                    devices.forEach(device => notifier.notify(device, episode.getAiredString(), ""))
                }
            })
        })
    } catch(error) {
        console.error(error)
    }
}