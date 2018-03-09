const fetch = require('node-fetch')

const prefs = require('../prefconfig.json')

class EpisodeInfoApi {

  constructor () {
    this.token = null
  }

  sendAuthenticate (apikey, username, userkey) {
    return fetch('https://api.thetvdb.com/login', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apikey,
        username: username,
        userkey: userkey
      })
    })
  }

  authenticate (apikey, username, userkey) {
    return new Promise((resolve, reject) => {
      if(this.token !== null) {
        return resolve()
      }
      return this.sendAuthenticate(apikey, username, userkey)
      .then(response => response.json())
      .then(json => {
        if (typeof json.token === 'undefined') {
          return reject(new Error('CouldNotAuthenticate: token in response was null'))
        }
        this.token = json.token
        return resolve()
      })
    })
  }

  sendGet (url, paramString) {
    return fetch(url + paramString, {
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Content-type': 'application/json'
      }
    }).then(response => response.json())
  }

  getEpisodes (showId) {
    const params = '/' + showId + '/episodes'
    return this.sendGet('https://api.thetvdb.com/series', params)
  }
}

module.exports = EpisodeInfoApi