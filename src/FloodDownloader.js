const fetch = require("node-fetch")

class FloodDownloader {

    constructor(baseUrl, username, password) {
        this.baseUrl = baseUrl
        this.username = username
        this.password = password
        this.jwt = ""
    }

    static async create(baseUrl, username, password) {
        const token = await FloodDownloader.getJwtToken(baseUrl, username, password)
        const downloader = new FloodDownloader(baseUrl, username, password)
        downloader.jwt = token
        return downloader
    }

    static async sendRequest(url, content, cookie="") {
        return fetch(url, {
            method: 'POST',
            headers: new fetch.Headers({
                "Content-Type": "application/json",
                "Content-Length": content.length.toString,
                "Cookie": cookie
            }),
            body: content
        })
    }

    static async getJwtToken(url, username, password) {
        const apiRoute = "/auth/authenticate"
        const content = JSON.stringify({
            "username": username,
            "password": password
        })

        return FloodDownloader.sendRequest(url + apiRoute, content)
        .then(async response => {
            if(response.status != 200) {
                throw new Error("Could not authenticate with downloader")
            }
            const json = await response.json()
            return json.token.split(" ")[1]
        })
        .catch(err => console.error(err))
    }

    async requestDownload(magnetUri, subdir) {
        if(!this.jwt) {
            this.jwt = await FloodDownloader.getJwtToken(this.baseUrl, this.username, this.password)
        }
        const apiRoute = "/api/client/add"
        const content = JSON.stringify({
            "urls": [magnetUri],
            "destination": "/media/hdd/Downloads",
            "isBasePath": false,
            "start": true,
            "tags": [""]
        })
        const cookie = `jwt=${this.jwt}`

        return FloodDownloader.sendRequest(this.baseUrl + apiRoute, content, cookie)
        .catch(err => console.error(err))
        
    }
}

module.exports = FloodDownloader
