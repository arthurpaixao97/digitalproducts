require('dotenv').config()
const router = require('express').Router()
const mw = require('../../../middlewares/middlewares.js')
const User = require('../../../db/schemas/users.js')
const bcrypt = require('bcrypt')
const u = require('../../../utils/utils.js')

const ADMIN = JSON.parse(process.env.ADMIN)

router.get('/', mw.session_auth, async (req, res) => {
    const user = await User.findOne({id: req.headers['x-user']})
    res.send(user)
})

router.post('/', async (req, res) => {
    var user = req.body
    user.password = bcrypt.hashSync(user.password, 10)
    if(ADMIN.find(u => u == req.body.email) != undefined)
    {
        user.role = 'ADMIN'
    } else
    {
        user.role = 'USER'
    }
    user.id = await u.uniqueID(8)
    user = await new User(user)
    try {
        await user.save()
        .then(r => {
            res.send(r)
        })   
    } catch (error) {
        res.send(error)
    }
})

module.exports = router