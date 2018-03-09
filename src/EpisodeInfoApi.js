const fetch = require('node-fetch')

const prefs = require('../prefconfig.json')

class EpisodeInfoApi {

  constructor () {
    this.token = null
  }

  async sendAuthenticate () {
    return fetch('https://api.thetvdb.com/login', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        apikey: prefs.apikey,
        username: prefs.username,
        userkey: prefs.userkey
      })
    })
  }

  async authenticate () {
    if (this.token === null) {
      const response = await (await this.sendAuthenticate()).json()

      if (typeof response.token === 'undefined') {
        throw 'CouldNotAuthenticate: token in response was null'
      }
      this.token = response.token
    }
  }

  async sendGet (url, paramString) {
    let response = await fetch(url + paramString, {
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Content-type': 'application/json'
      }
    })
    return response.json()
  }

  async checkForNewEpisodes(showIds) {

  }

  async getEpisodes (showId) {
    const params = '/' + showId + '/episodes'
    return this.sendGet('https://api.thetvdb.com/series', params)
  }
}

module.exports = EpisodeInfoApi
