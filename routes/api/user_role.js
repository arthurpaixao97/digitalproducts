const router = require('express').Router()
const mw = require('../../middlewares/middlewares.js')

const users = require('./user_role/users.js')
router.use('/users', users)

module.exports = router