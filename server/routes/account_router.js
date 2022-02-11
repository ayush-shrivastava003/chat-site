import express from 'express'
import UserModel from '../models/user_model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { logCustom } from '../logger.js'

const AccountRouter = new express.Router()

function getToken(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64')).id
}

async function userExists (username) {
    let result = await UserModel.findOne({username: username});
    return result !== null;
}

async function userIdExists (userid) {
    let result = await UserModel.findById(userid);
    return result !== null;
}

async function verifyLogin(req, res, next) {
    let info = req.cookies.info
    info = decodeURIComponent(info)
    if (info !== "undefined") {
        let token = JSON.parse(info).token
        if (!token || // if token expired/never existed
            !jwt.verify(token, process.env.JWT_SECRET) || // if token was tampered with or somehow failed verification
            !(await UserModel.exists({_id: getToken(token)})) // if account was deleted
        ) return res.redirect('/account/login')
        next()
    } else {return res.redirect("/account/login")}

}

AccountRouter.get('/', verifyLogin, async (req, res) => {
    let token = req.cookies.info
    let user = await UserModel.findById(getToken(token))
    return res.render('profile', {user})
})

AccountRouter.get('/register', (req, res) => {
    res.render('register')
})

AccountRouter.get('/login', (req, res) => {
    res.render('login')
})

AccountRouter.post('/register', async (req, res) => {
    logCustom("register event");
    let {username, password} = req.body

    if (await userExists(username)) {
        logCustom("username already exists");
        return res.json({status: "error", error: `The username ${username} is already in use!`})
    }
    logCustom("exists checkpoint");

    if (password.length >= 8) {
        logCustom("register success");
        let pwd = await bcrypt.hash(password, 10)
        let user = new UserModel({
            username: username,
            password: pwd,
        })
        await user.save()
        let token = await jwt.sign({id: user._id}, process.env.JWT_SECRET)
        logCustom(`${req.connection.remoteAddress} REGISTERED the account ${user._id} (${user.username})`)
        return res.cookie(
            'info', 
            JSON.stringify({username, token}),
            {maxAge: 60480000}
            ).status(200).json({status: "ok"})

    } else {return res.status(400).json({error: 'Password should be at least 8 characters!'})}
})

AccountRouter.post('/login', async (req, res) => {
    let {username, password} = req.body
    let user = await UserModel.findOne({username})

    if (!user) return res.status(400).json({status: 'error', error: 'Invalid username or password'})

    if (user.account_status.match("disabled|deactivated|locked|suspended")) {return res.status(400).json({status:"error", error:"Account has been disabled contact a developer to find out why"})}

    if (await bcrypt.compare(password, user.password)) {
        let token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        logCustom(`${req.connection.remoteAddress} LOGGED INTO the account ${user._id} (${user.username})`)
        let account_status = user.account_status;
        return res.cookie('info', JSON.stringify({username, token, account_status})).status(200).json({status: 'ok'})
    } else return res.status(400).json({status: 'error', error: 'Invalid username or password'})
})

export {AccountRouter, verifyLogin, getToken, userExists, userIdExists}