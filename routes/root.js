const router = require('express').Router()
const u = require('../utils/utils.js')

const usersRouter = require('./root/users.js')
const rolesRouter = require('./root/roles.js')

router.use('/users', usersRouter)
router.use('/roles', rolesRouter)

module.exports = router