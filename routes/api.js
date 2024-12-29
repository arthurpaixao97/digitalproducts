const router = require('express').Router()
const mw = require('../middlewares/middlewares.js')

const apiClient = require('./api/client.js')
const apiBKF = require('./api/backoffice.js')

router.use('/', apiClient)
router.use('/backoffice', mw.session_auth, mw.rolePermissions('BKF'), apiBKF)

module.exports = router