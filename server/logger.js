import fs from 'fs'

function getDate() {
    let d = new Date()
    let day = d.getDate()
    let month = d.getMonth() + 1
    let year = d.getFullYear()

    return `${month}/${day}/${year}`
}

function logReq(req, res, next) {
    fs.appendFile(
        'logs.log',
        `${getDate()} @ ${Date.now()}: ${req.connection.remoteAddress} made a ${
            req.method
        } request for ${req.originalUrl}\n`,
        () => {}
    )
    next()
}

function logCustom(msg) {
    fs.appendFile('logs.log', `${getDate()} @ ${Date.now()}: ${msg}\n`, () => {})
}

function logErr(msg) {
    fs.appendFile('logs.log', `ERROR: ${getDate()} @ ${Date.now()}: ${msg}\n`, () => {})
}

export {logCustom, logReq, logErr, getDate}
