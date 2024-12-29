const router = require('express').Router()
const User = require('../../../db/schemas/users.js')
const bcrypt = require('bcrypt')

router.get('/', async (req, res) => {
    const user = await User.find(req.query)
    res.send(user)
})

module.exports = router