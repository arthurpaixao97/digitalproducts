const router = require('express').Router()
const mw = require('../../middlewares/middlewares.js')

const users = require('./client/users.js')
router.use('/users', users)

module.exports = router