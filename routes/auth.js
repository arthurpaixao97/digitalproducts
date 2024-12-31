// Loads environment variables from a .env file
require('dotenv').config()

// Imports the Express router and other required modules
const router = require('express').Router()

// Imports the session and user schemas from the database
const Session = require('../db/schemas/sessions.js')
const User = require('../db/schemas/users.js')

// Imports the UUID library to generate unique session tokens
const uuid = require('uuid')

// Imports the bcrypt library for password hashing and comparison
const bcrypt = require('bcrypt')

// Imports middleware (not used in this code snippet, but may be used in other routes)
const mw = require('../middlewares/middlewares.js')

// Reads the session duration from an environment variable
const DURATION = parseInt(process.env.DURATION)

// Defines the GET route to retrieve existing sessions
router.get('/', async (req, res) => {
    // Searches for sessions in the database based on the query parameters
    const session = await Session.find(req.query)
    
    // Sends the found sessions as a response
    res.send(session)
})

// Defines the POST route to create a new session
router.post('/', async (req, res) => {
    // Attempts to find a user in the database by the provided email
    const user = await User.findOne({email: req.body.email})
    
    // Checks if the user was found
    if(user)
    {
        // Compares the provided password with the stored password in the database
        if(bcrypt.compareSync(req.body.password, user.password))
        {
            // Creates a new session object with a randomly generated token (UUID)
            const session = {
                token: uuid.v4(),  // Generates a unique UUID for the session
                user: user.id,     // Stores the user ID associated with the session
                role: user.role,   // Stores the user role (e.g., admin, regular user)
                expires: new Date(new Date(Date.now() + DURATION).toISOString()).toISOString()  // Sets the session expiration date
            }

            // Checks if there is an active session for the user with a future expiration date
            const checkSession = await Session.findOne({user: session.user, expires: {$gte: new Date().toISOString()}})
            
            // If an active session is found, deletes the previous session
            if(checkSession)
            {
               await Session.findOneAndDelete({user: checkSession.user})    
            }

            // Creates and saves the new session to the database
            const newSession = await new Session(session)
            await newSession.save()
            .then(r => {
                // Sends the created session as a response
                res.send(r)
            })

        } else
        {
            // If the password is incorrect, sends a 401 Unauthorized error
            res.status(401).send({
                status: 401,
                message:'Invalid credentials'
            })
        }
    } else
    {
        // If the user is not found, sends a 404 Not Found error
        res.status(404).send({
            status: 404,
            message:'User not found'
        })
    }
})

// Exports the router to be used in other files
module.exports = router