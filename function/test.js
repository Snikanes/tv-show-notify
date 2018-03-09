const tvshows = require("../tvshows.json")
const func = require("./index")

context = { 
    bindings: {
        tvshows: { ...tvshows }
    }
}

function run(context) {
    func(context)
}

run(context)
