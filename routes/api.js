// Imports the Express router
const router = require('express').Router()

// Imports custom middleware for authentication and permissions
const mw = require('../middlewares/middlewares.js')

// Imports API route handlers for the client and backoffice
const apiClient = require('./api/client.js')
const apiBKF = require('./api/backoffice.js')

// Defines the base route to use the client API
router.use('/', apiClient)

// Defines the '/backoffice' route, applying authentication and role-based access control (permissions)
// The session_auth middleware checks if the user is authenticated
// The rolePermissions middleware ensures the user has the 'BKF' role to access backoffice resources
router.use('/backoffice', mw.session_auth, mw.rolePermissions('BKF'), apiBKF)

// Exports the router to be used in other files
module.exports = router