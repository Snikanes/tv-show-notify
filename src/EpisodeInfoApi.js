const fetch = require('node-fetch')
const prefs = require('../config.js')

class EpisodeInfoApi {

  constructor (requester) {
    this.token = null
    this.requester = requester || fetch
  }

  sendAuthenticate (apikey, username, userkey) {
    return this.requester('https://api.thetvdb.com/login', {
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

async authenticate (apikey, username, userkey) {
	if(this.token !== null) {
		return resolve()
	}
	const response = await this.sendAuthenticate(apikey, username, userkey)
	if(response.status !== 200) {
		throw new Error(`Request failed: status was ${response.status}`)
	}
	const json = await response.json()
	if (typeof json.token === 'undefined') {
		throw new Error('CouldNotAuthenticate: token in response was null')
	}
	this.token = json.token
}

  sendGet (url, paramString) {
    return this.requester(url + paramString, {
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Content-type': 'application/json'
      }
    }).then(response => response.json())
  }

  getShowInfo (showId) {
    const params = '/' + showId
    return this.sendGet('https://api.thetvdb.com/series', params)
  }

  getEpisodes (showId) {
    const params = '/' + showId + '/episodes'
    return this.sendGet('https://api.thetvdb.com/series', params)
  }
}

module.exports = EpisodeInfoApi
