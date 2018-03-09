const pushbullet = require("pushbullet")
const PushBullet = require("pushbullet")
const prefs = require("../prefconfig.json")

class Notifier {

    constructor() {
        this.pusher = new PushBullet(prefs.pushbulletToken)
    }

    async notify(device, title, body) {
        return new Promise((resolve, reject) => {
            this.pusher.note(device.iden, title, body, (error, response) => {
                if(error) {
                    return reject(error)
                } else {
                    return resolve(response)
                }
            })
        })
    }

    async getDevices() {
        return new Promise((resolve, reject) => {
            this.pusher.devices((error, response) => {
                if(error) {
                    return reject(error)
                } else {
                    return resolve(response.devices)
                }
            })
        })
    }
}

module.exports = Notifier