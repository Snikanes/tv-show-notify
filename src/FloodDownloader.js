const fetch = require("node-fetch")

class FloodDownloader {

    constructor() {
        this.jwt = ""
    }

    static async create(url, username, password) {
        const token = await FloodDownloader.getJwtToken(url, username, password)
        const downloader = new FloodDownloader()
        downloader.jwt = token
        return downloader
    }

    static async sendRequest(url, content, cookie="") {
        return fetch(url, {
            method: 'POST',
            headers: new fetch.Headers({
                'Content-Type': 'application/json',
                'Content-Length': content.length.toString
            }),
            cookie: cookie,
            body: content
        })
    }

    static async getJwtToken(url, username, password) {
        const content = JSON.stringify({
            "username": username,
            "password": password
        })

        return FloodDownloader.sendRequest(url, content)
        .then(async response => {
            if(response.status != 200) {
                throw new Error("Could not authenticate with downloader")
            }
            const json = await response.json()
            return json.token.split(" ")[1]
        })
        .catch(err => console.error(err))
    }

    async requestDownload(magnetUri, jwt, subdir) {
        if(this.jwt.length === 0) {
            this.jwt = await this.getJwtToken()
        }
        const content = JSON.stringify({
            "urls": [magnetUri],
            "destination": `/home/snikanes/Downloads/${subdir}`,
            "isBasePath": false,
            "start": true,
            "tags": [""]
        })
        const cookie = `jwt=${jwt}`
        return this.sendRequest(url, content, cookie)
        .catch(err => console.error(err))
        
    }
}