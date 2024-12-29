const router = require('express').Router()

const users = require('./backoffice/users.js')
router.use('/users', users)

module.exports = router