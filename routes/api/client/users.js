const router = require('express').Router()
const mw = require('../../../middlewares/middlewares.js')
const User = require('../../../db/schemas/users.js')
const bcrypt = require('bcrypt')
const u = require('../../../utils/utils.js')

router.get('/', mw.session_auth, async (req, res) => {
    const user = await User.findOne({id: req.headers['x-user']})
    res.send(user)
})

router.post('/', async (req, res) => {
    var user = req.body
    user.password = bcrypt.hashSync(user.password, 10)
    user.role = 'CLIENT'
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

router.patch('/', mw.session_auth, async (req, res) => {
    var updates = {}

    if(req.body.name != undefined) updates.name = req.body.name
    
    if(req.body.email != undefined) updates.email = req.body.email
    
    if(req.body.password != undefined) updates.password = bcrypt.hashSync(req.body.password, 10)
    
    // if(req.body.role != undefined && u.checkPermission(req, 'role_patch')) updates.role = req.body.role

    try {
        await User.findOneAndUpdate({id: req.headers['x-user']}, updates, {new: true})
        .then(r => {
            res.send(r)
        })
    } catch (error) {
        res.send(error)
    }
})

module.exports = router