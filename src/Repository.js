const Database = require("better-sqlite3")

module.exports = class Repository {

    constructor() {
        this.connection = Database("database.db")
        this.connection.exec("CREATE TABLE IF NOT EXISTS shows (id integer primary key, name text, available_for_streaming bool)")
    }

    createTrackedShow(tvdbId, name, availableForStreaming) {
        const params = {
            "id": tvdbId,
            "name": name,
            "available_for_streaming": availableForStreaming ? 1 : 0 ,
        }
        const stmt = this.connection.prepare(`INSERT INTO shows VALUES (:id, :name, :available_for_streaming)`)
        stmt.run(params)
    }

    getAllTrackedShows() {
        const stmt = this.connection.prepare(`SELECT * FROM shows`)
        return stmt.all()
    }

    getAvailableForStreaming(tvdbId) {
        const params = {
            "id": tvdbId,
        }
        const stmt = this.connection.prepare(`SELECT available_for_streaming FROM shows WHERE id = :id`)
        return stmt.get(params).id
    }
}