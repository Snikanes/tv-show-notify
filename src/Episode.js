const moment = require('moment')

class Episode {

    constructor (id, showId, showName, season, episodeNumber, dateAiredString) {
        this.id = id
        this.showId = showId
        this.showName = showName
        this.season = season
        this.episodeNumber = episodeNumber
        this.dateAired = moment(dateAiredString, 'YYYY-MM-DD')
    }

    static fromJson (json, showId, showName) {
        return new Episode(json.id, showId, showName, json.airedSeason, json.airedEpisodeNumber, json.firstAired)
    }

    didAirToday() {
        return this.dateAired.isValid() && moment().isSame(this.dateAired, "day")
    }

    getAiredString() {
        return `${this.showName} airing today!`
    }
}

module.exports = Episode
