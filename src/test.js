const tvshows = require("../tvshows.json")
const func = require("./function")

context = { 
    bindings: {
        tvshows: { ...tvshows }
    }
}

async function run(context) {
    await func(context)
}

run(context)
