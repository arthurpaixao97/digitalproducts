const router = require('express').Router()
const mw = require('../middlewares/middlewares.js')

const apiUser = require('./api/user_role.js')
const apiAdmin = require('./api/admin_role.js')

router.use('/', apiUser)
router.use('/admin', mw.session_auth, mw.admin, apiAdmin)

module.exports = router