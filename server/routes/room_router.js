import express from 'express'
import UserModel from '../models/user_model.js'
import RoomModel from '../models/room_model.js'
import {verifyLogin} from './account_router.js'
import mongoose from 'mongoose'

const RoomRouter = new express.Router()

RoomRouter.use(verifyLogin) // only allow messaging to those who are logged in

RoomRouter.get('/', async (req, res) => {
    let rooms = await RoomModel.find()
    res.render('home', {rooms: rooms})
})

RoomRouter.get('/:room', async (req, res) => {
    let id = req.params.room
    if (mongoose.isValidObjectId(id)) {
        let room = await RoomModel.findById(id).sort({epochTime: 1})
        if (!room) {return res.render('404')}

        room.messages.splice(0, 25)
        let msgs = JSON.parse(JSON.stringify(room.messages)) // deep copy of room.messages
        await Promise.all(msgs.map(async (msg) => {
            let author = (await UserModel.findById(msg.author)).username
            msgs[msgs.indexOf(msg)].author = author
        }))
    
        res.render('room', {messages: msgs, roomName: room.name, roomId: room._id})
    } else {return res.render('404')}
})

RoomRouter.post('/:room/load', async (req, res) => {
    let id = req.params.room
    if (
        !(mongoose.isValidObjectId(id))
        ||
        !(await RoomModel.exists({_id: id}))
    ) {return res.render('404')}

    let messages = (await RoomModel.findById(id)).messages
    messages.splice(req.body.offset, 25)
    console.log(messages, typeof messages)
    


})

export default RoomRouter