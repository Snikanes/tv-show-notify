const pushbullet = require("pushbullet")
const PushBullet = require("pushbullet")
const prefs = require("../prefconfig.json")

class Notifier {

    constructor(pushbulletToken) {
        this.pusher = new PushBullet(pushbulletToken)
    }

    async notifySingle(device, title, body) {
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

    async notify(devices, title, body) {
        return Promise.all(devices.map(device => this.notifySingle(device, title, body)))
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