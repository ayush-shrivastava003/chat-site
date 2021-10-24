import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    accessibleTo:  [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Message'
    }]
})

const RoomModel = mongoose.model('Room', roomSchema)

export default RoomModel