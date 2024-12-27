const router = require('express').Router()

const users = require('./admin_role/users.js')
router.use('/users', users)

module.exports = router