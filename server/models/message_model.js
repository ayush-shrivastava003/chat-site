import mongoose from 'mongoose'
import {getDate} from '../logger.js'

const messageSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
    },
    epochTime: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
})

messageSchema.pre('validate', function (next) {
    this.date = getDate()
    this.epochTime = Date.now()
    next()
})

const MessageModel = new mongoose.model('Message', messageSchema)

export default MessageModel
