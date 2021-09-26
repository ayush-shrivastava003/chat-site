import express from 'express'
import rateLimit from 'express-rate-limit'
import fs from 'fs'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import {logReq, logCustom, logErr, getDate} from './logger.js'
import verifyLogin from './login_checker.js'
import MessageModel from './models/message_model.js'

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

        console.log(`Connected to DB: ${process.env.DB}.`)
        logCustom(`Connected to DB: ${process.env.DB}.`)
    }
)

const server = express()

server.set('view engine', 'ejs')
server.use('/assets', express.static(path.resolve() + '../assets'))
server.use(cookieParser())
server.use(express.json())
server.use(logReq)

server.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}.`)
    logCustom(`Listening on port: ${process.env.PORT}.`)
})

server.get('/', async (req, res) => {
    res.render('index')
})

server.post('/post', async (req, res) => {
    try {
        let msg = req.body.msg
        let newMsg = new MessageModel({
            content: msg,
        })
        await newMsg.save()
        logCustom(`Message received: ${msg}`)
        return res.json({status: 'ok'})
    } catch (err) {
        return res.json({status: 'error', error: err.toString()})
    }
})

// server.get("/home", verifyLogin, async (req, res) => {
//     res.render("index")
// })
