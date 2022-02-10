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
        `${getDate()} @ ${new Date().toTimeString()}: ${req.connection.remoteAddress} made a ${
            req.method
        } request for ${req.originalUrl}\n`,
        () => {}
    )
    next()
}

function logCustom(msg) {
    fs.appendFile('logs.log', `${getDate()} @ ${new Date().toTimeString()}: ${msg}\n`, () => {})
}

function logErr(msg) {
    fs.appendFile('logs.log', `ERROR: ${getDate()} @ ${new Date().toTimeString()}: ${msg}\n`, () => {})
}

function logMsg(msg) {
    fs.appendFile("msgs.log", `MSG: from="${msg.author}" date="${msg.date}" time="${new Date().toTimeString()}" roomId="${msg.roomId}" username="${msg.usrname}"\n`, () => {});
}

function logConnect(msg) {
    fs.appendFile('connect.log', `${msg}\n`, () => {})
}

export {logCustom, logReq, logErr, getDate, logMsg, logConnect}
