// Import the required modules
const router = require('express').Router()     // Express router for handling requests
const User = require('../../../db/schemas/users.js') // User schema for interacting with the users collection
const bcrypt = require('bcrypt')               // Library for password hashing (not used in this snippet but imported)

// Defines the GET route to fetch users based on query parameters
router.get('/', async (req, res) => {
    // Finds users based on the query parameters from the request
    const users = await User.find(req.query)
    
    // Sends the retrieved users as a response
    res.send(users)
})

// Exports the router to be used in other files
module.exports = router