// Import the required modules
const router = require('express').Router()
const mw = require('../../../middlewares/middlewares.js')  // Middleware for session authentication
const User = require('../../../db/schemas/users.js')      // User schema for interacting with the users collection
const bcrypt = require('bcrypt')                          // Library for password hashing
const u = require('../../../utils/utils.js')              // Utility functions

// Defines the GET route to fetch the current user's data
router.get('/', mw.session_auth, async (req, res) => {
    // Finds the user based on the ID from the request headers
    const user = await User.findOne({id: req.headers['x-user']})
    
    // Sends the user's data as the response
    res.send(user)
})

// Defines the POST route to create a new user
router.post('/', async (req, res) => {
    var user = req.body
    // Hashes the password before saving it
    user.password = bcrypt.hashSync(user.password, 10)
    
    // Sets the default role for the user as 'CLIENT'
    user.role = 'CLIENT'
    
    // Generates a unique ID for the user
    user.id = await u.uniqueID(8)
    
    // Creates a new instance of the User model with the provided data
    user = await new User(user)
    
    try {
        // Saves the new user to the database and sends the created user as the response
        await user.save()
        .then(r => {
            res.send(r)
        })
    } catch (error) {
        // Sends an error response if saving the user fails
        res.send(error)
    }
})

// Defines the PATCH route to update the current user's data
router.patch('/', mw.session_auth, async (req, res) => {
    var updates = {}

    // Updates the user's name if provided in the request body
    if(req.body.name != undefined) updates.name = req.body.name
    
    // Updates the user's email if provided in the request body
    if(req.body.email != undefined) updates.email = req.body.email
    
    // Updates the user's password if provided, and hashes the new password
    if(req.body.password != undefined) updates.password = bcrypt.hashSync(req.body.password, 10)

    try {
        // Finds the user by the ID in the request headers and updates the user's data
        await User.findOneAndUpdate({id: req.headers['x-user']}, updates, {new: true})
        .then(r => {
            // Sends the updated user as the response
            res.send(r)
        })
    } catch (error) {
        // Sends an error response if updating the user fails
        res.send(error)
    }
})

// Exports the router to be used in other files
module.exports = router