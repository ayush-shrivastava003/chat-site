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
            author: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
    }}],
    picture: {
        type: String,
        default: "assets/avatars/default.png",
        required: false,
    }
})

const RoomModel = mongoose.model('Room', roomSchema)

export default RoomModel