const redis = require("redis")
const bluebird = require("bluebird")
const Episode = require("./Episode")
bluebird.promisifyAll(redis.RedisClient.prototype);

class RedisRepository {

    constructor(host='127.0.0.1', port=6379) {
        this.client = redis.createClient(port, host);        
    }

    async appendToQueue(episode) {
        const episodeSignature = episode.showName + episode.season + episode.episodeNumber
        try {
            const alreadyQueued = await this.client.sismemberAsync("episodeQueueMembers", episodeSignature)
            if(!alreadyQueued) {
                await this.client.saddAsync("episodeQueueMembers", episodeSignature)
                await this.client.lpush("episodeQueue", episodeSignature)
                await this.client.hmsetAsync(episodeSignature, episode.toRedisFields())
            }
        } catch (error) {
            console.error(error)
        }
    }

    async popFromQueue() {
        try {
            const queueLength = await this.client.llenAsync("episodeQueue")
            if (queueLength > 0) {
                const poppedSignature = await this.client.rpopAsync("episodeQueue")
                await this.client.sremAsync("episodeQueueMembers", poppedSignature)
                return this.client.hmgetAsync(poppedSignature, "id", "showId", "showName", "season", "episodeNumber")
            }
        } catch (error) {
            console.error(error)
        }
    }

    async getQueueLength() {
        return await this.client.llenAsync("episodeQueue")
    }
}

module.exports = RedisRepository;


// (async () => {    
//     const testEpisode = new Episode(6611267, 277165, 'Silicon Valley', 5, 6)

//     const repo = new module.exports()
//     console.log("startng")
//     try {
//         await repo.appendToQueue(testEpisode.toRedisFields())
//         const popped = await repo.popFromQueue()
//         console.log("popped" + popped)
//         const episode = Episode.fromRedisFields(popped)
//         console.log(episode)
//     } catch (error) {
//         console.error(error)
//     }
    
//     console.log("done")
//     return Promise.resolve()
// })();
