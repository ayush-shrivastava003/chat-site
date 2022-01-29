import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import {logReq, logCustom, logErr, getDate} from './logger.js'
import RoomModel from './models/room_model.js'
import http from 'http'
import {Server} from 'socket.io'
import RoomRouter from './routes/room_router.js'
import {AccountRouter, getToken} from './routes/account_router.js'
import {dirname} from 'path'
import {fileURLToPath} from 'url'
import cookie from 'cookie'

dotenv.config()
mongoose.connect(
    process.env.DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    async (err) => {
        if (err) {
            logErr(err.message)
            throw err
        }

        await new RoomModel({name: "secondary"}).save()

        console.log(`Connected to DB: ${process.env.DB}.`)
        logCustom(`Connected to DB: ${process.env.DB}.`)
    }
)


const server = express()
const HTTPServer = http.Server(server)
const socket = new Server(HTTPServer)
const __dirname = dirname(fileURLToPath(import.meta.url))
let usersTyping = []

server.set('view engine', 'ejs')
server.use('/assets', express.static(path.resolve(__dirname + '../../assets')))
server.use(cookieParser())
server.use(express.json())
server.use(logReq)

socket.on("connection", (socket) => {
    logCustom(`accepted connection from ${socket.handshake.address}`)
    socket.on("disconnect", () => {
        logCustom(`lost connection from ${socket.handshake.address}`)
    })

    socket.on("message", async (msg) => {

        let room = await RoomModel.findById(msg.roomId)
        room.messages.push({
            date: getDate(),
            epochTime: Date.now(),
            content: msg.content,
            author: getToken(JSON.parse(cookie.parse(socket.handshake.headers.cookie).info).token)
        })
        await room.save()

        socket.broadcast.emit("new", msg)
    })

    socket.on("typing", (author) => {
        if (usersTyping.indexOf(author) < 0) {
            usersTyping.push(author)
            socket.broadcast.emit("typing", usersTyping)
        }
    })

    socket.on("stop typing", (author) => {
        if (usersTyping.indexOf(author) < 0) {
            return;
        }
        usersTyping.splice(usersTyping.indexOf(author), 1)
        socket.broadcast.emit("stop typing",usersTyping)
    })

    socket.on("room change", async (name, id) => {
        let room = await RoomModel.findById(id)
        room.name = name
        await room.save()
        socket.broadcast.emit("room change", name)
    })
})

server.get('/', async (req, res) => {
    res.render('index')
})

server.use('/chats', RoomRouter)
server.use('/account', AccountRouter)

server.get("*", async (req, res) => {
    res.render('404')
})

HTTPServer.listen(process.env.PORT, ()=> {
    console.log("Started HTTP server. Port:", process.env.PORT)
    logCustom("Started HTTP server. Port:", process.env.PORT)
})