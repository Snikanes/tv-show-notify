const moment = require('moment-timezone')

class Episode {

    constructor (id, showId, showName, season, episodeNumber, dateAiredString, airsTime) {
        this.id = id
        this.showId = showId
        this.showName = showName
        this.season = season
        this.episodeNumber = episodeNumber
        this.dateTimeAired = moment.tz(dateAiredString + " " + airsTime, 'YYYY-MM-DD h:mm a', "America/New_York")
    }

    static fromJson (json, showId, showName, airsTime) {
        return new Episode(json.id, showId, showName, json.airedSeason, json.airedEpisodeNumber, json.firstAired, airsTime)
    }

    justAired(offset_hours, now) {
        const now_time = now || moment()    
        const notify_time = this.dateTimeAired.add(offset_hours, 'hours')
        return this.dateTimeAired.isValid() && now_time.isSame(notify_time, 'hour')
    }

    getAiredString(timezone) {
        return `${this.showName} airing at ${this.getAiredDateTimeString(timezone)}!`
    }

    getAiredDateTime(timezone) {
        return moment(this.dateTimeAired).clone().tz(timezone)
    }

    getAiredDateTimeString(timezone) {
        return this.getAiredDateTime(timezone).format("HH:mm")
    }
}

module.exports = Episode
