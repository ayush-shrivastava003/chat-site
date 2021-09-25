import express from 'express'
import rateLimit from 'express-rate-limit'
import fs from 'fs'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import {logReq, logCustom} from './logger.js'

dotenv.config()
mongoose.connect(
    process.env.DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    async (err) => {
        if (err) throw err
        console.log(`Connected to DB: ${process.env.DB}.`)
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
})

server.get("/", async (req, res) => {
    res.render("index")
})

server.get("/log", async (req, res) => {
    res.render("index")
})