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
    }
})

const UserModel = mongoose.model('User', userSchema)

export default UserModel