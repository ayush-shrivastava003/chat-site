import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
        default: "assets/avatars/default.png"
    },
    about: {
        type: String,
        required: false,
        default: "I am shy"
    },
    bio: {
        type: String,
        required: false,
        default: "I have no life"
    },
    account_status: {
        type: String,
        required: false,
        default: "active"
    }
})

const UserModel = mongoose.model('User', userSchema)

export default UserModel