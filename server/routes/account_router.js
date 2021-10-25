import express, { response } from 'express'
import UserModel from '../models/user_model.js'
import verifyLogin from '../login_checker.js'

const AccountRouter = new express.Router()

AccountRouter.get('/', verifyLogin, async (req, res) => {
    res.render('profile')
})

AccountRouter.get('/register', (req, res) => {
    res.render('register')
})

AccountRouter.get('/login', (req, res) => {
    res.render('login')
})

AccountRouter.post('/register', async (req, res) => {
    res.json({status: "ok"})
})

AccountRouter.post('/login', async (req, res) => {
    res.json({status: "ok"})
})

export default AccountRouter