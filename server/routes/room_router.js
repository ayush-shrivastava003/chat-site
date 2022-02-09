import express from 'express'
import UserModel from '../models/user_model.js'
import RoomModel from '../models/room_model.js'
import {verifyLogin} from './account_router.js'
import mongoose from 'mongoose'

const RoomRouter = new express.Router()

RoomRouter.use(verifyLogin) // only allow messaging to those who are logged in
RoomRouter.use(express.urlencoded({extended: true}))

async function getAuthors(messages) {
    messages = JSON.parse(JSON.stringify(messages)) // deep copy of room.messages
    // console.log(messages)
    await Promise.all(messages.map(async (msg) => {
        let author = (await UserModel.findById(msg.author)).username
        messages[messages.indexOf(msg)].author = author
    }))
    return messages
}

RoomRouter.get('/', async (req, res) => {
    let rooms = await RoomModel.find().sort({})
    res.render('home', {rooms: rooms})
})

RoomRouter.get('/new', async (req, res) => {
    let newRoom = new RoomModel({name: "New Room"})
    await newRoom.save()
    return res.redirect(`/chats/${newRoom._id}`)
})

RoomRouter.get('/:room', async (req, res) => {
    let id = req.params.room
    if (mongoose.isValidObjectId(id)) {
        let room = await RoomModel.findById(id).sort({epochTime: 1})
        if (!room) {return res.render('404')}

        room.messages.splice(0, room.messages.length-25)
        let msgs = await getAuthors(room.messages) 
        res.render('room', {messages: msgs, roomName: room.name, roomId: room._id})
    } else {return res.render('404')}
})

RoomRouter.post('/:room/load', async (req, res) => {
    let id = req.params.room
    let {offset, loaded} = req.body

    if (
        !(mongoose.isValidObjectId(id))
        ||
        !(await RoomModel.exists({_id: id}))
    ) {return res.render('404')}

    let room = await RoomModel.findById(id)
    let messages = room.messages
    let len = messages.length
    if (len-loaded < 25) {
        messages.splice(len-loaded, loaded)
    } else {
        messages = messages.splice(len-loaded-25, loaded)
    }
    
    messages = await getAuthors(messages)
    return res.render("messages", {roomId: id, messages: messages, roomName: room.name})
})

export default RoomRouter