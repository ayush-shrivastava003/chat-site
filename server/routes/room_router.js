import express from 'express'
import MessageModel from '../models/message_model.js'
import RoomModel from '../models/room_model.js'

const RoomRouter = new express.Router()

RoomRouter.get('/', async (req, res) => {
    let rooms = await RoomModel.find()
    res.render('home', {rooms: rooms})
})

RoomRouter.get('/:room', async (req, res) => {
    let id = req.params.room
    let room = await RoomModel.findById(id)

    if (!room) {return res.render('404')}

    let messages = []
    await Promise.all(
        room.messages.map(async messageId => {
            let message = await MessageModel.findById(messageId)
            messages.push(message)
        })
    )
    res.render('room', {messages: messages})
})

export default RoomRouter