import express from 'express'
import UserModel from '../models/user_model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const AccountRouter = new express.Router()

async function verifyLogin(req, res, next) {
    let token = req.cookies.token
    if (!token || 
        !jwt.verify(token, process.env.JWT_SECRET) ||
        !(await UserModel.exists({_id: JSON.parse(Buffer.from(token.split('.')[1], 'base64')).id}))
    ) return res.redirect('/account/register')

    next()

}

AccountRouter.get('/', verifyLogin, async (req, res) => {
    return res.render('profile')
})

AccountRouter.get('/register', (req, res) => {
    res.render('register')
})

AccountRouter.get('/login', (req, res) => {
    res.render('login')
})

AccountRouter.post('/register', async (req, res) => {
    let {username, password} = req.body

    if (password.length >= 8) {
        let pwd = await bcrypt.hash(password, 10)
        let user = new UserModel({
            username: username,
            password: pwd,
        })
        await user.save()

        let token = await jwt.sign({id: user._id}, process.env.JWT_SECRET)
        return res.cookie('token', token).status(200).json({status: "ok"})

    } else {return res.status(400).json({error: 'Password should be at least 8 characters!'})}
})

AccountRouter.post('/login', async (req, res) => {
    let {username, password} = req.body
    let user = await UserModel.findOne({username})

    if (!user) return res.status(400).json({status: 'error', error: 'Invalid username or password'})

    if (await bcrypt.compare(password, user.password)) {
        let token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        return res.cookie('token', token).status(200).json({status: 'ok'})
    } else return res.status(400).json({status: 'error', error: 'Invalid username or password'})
})

export {AccountRouter, verifyLogin}