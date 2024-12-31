// Imports the Express router
const router = require('express').Router()

// Imports utility functions
const u = require('../../utils/utils.js')

// Imports the User and Role schemas for interacting with the users and roles collections in the database
const User = require('../../db/schemas/users.js')
const Role = require('../../db/schemas/roles.js')

// Imports bcrypt for password hashing
const bcrypt = require('bcrypt')

// Defines the GET route to retrieve users from the database
router.get('/', async (req, res) => {
    // Fetches users from the database based on the query parameters
    const users = await User.find(req.query)
    
    // Sends the retrieved users as a response
    res.status(200).send(users)
})

// Defines the POST route to create a new user
router.post('/', async (req, res) => {
    var userBody = req.body
    // Generates a unique ID for the user
    userBody.id = await u.uniqueID(8)
    
    // Hashes the user's password before saving it
    userBody.password = bcrypt.hashSync(userBody.password, 10)

    // Sets the user's role using the utility function
    await u.setRole(userBody)

    // Creates a new User instance
    const user = await new User(userBody)
    
    try {
        // Saves the new user to the database
        await user.save()
        
        // Sends a response indicating the user was created successfully
        res.status(201).send({
            status: 201,
            message: 'Created',
            user: user
        })
    } catch (error) {
        // Sends an error response if saving the user fails
        res.send(error)
    }
})

// Defines the PATCH route to update a user by ID
router.patch('/:id', async (req, res) => {
    var newData = {}
    // Loops through the request body and adds fields to update, excluding certain fields
    for (const key in req.body) {
        if(key != '_id' && key != '__v' && key != 'role' && key != 'permissions')
        {
            newData[key] = req.body[key]
        }
    }

    // Updates the user's data in the database
    await User.findOneAndUpdate({id: req.params.id}, newData, {new: true})
    .then(u => {
        // Sends a response indicating the user was updated
        res.status(200).send({
            status: 200,
            message: 'User updated',
            user: u
        })
    })
})

// Defines the POST route to assign a role to a user
router.post('/:id/role/:role', async (req, res) => {

    // Finds the user by ID
    const user = await User.findOne({id: req.params.id})
    if(!user || user == null)
    {
        // Sends a 404 response if the user is not found
        res.status(404).send({
            status: 404,
            message: 'User not found'
        })
    } else if(user != undefined && user != null)
    {
        // Finds the role by its name
        const role = await Role.findOne({name: req.params.role})
    
        if(!role || role == null)
        {
            // Sends a 404 response if the role is not found
            res.status(404).send({
                status: 404,
                message: 'Role not found'
            })
        } else if(role != undefined && role != null)
        {
            try {
                // Updates the user's role in the database
                await User.findOneAndUpdate({id: user.id}, {role: role.name}, {new: true})
                .then(u => {
                    // Sends a response indicating the role was assigned successfully
                    res.status(200).send({
                        status: 200,
                        message: 'Role set',
                        user: u
                    })
                })
            } catch (error) {
                // Sends an error response if updating the user fails
                res.send(error)
            }
        }
    }
})

// Defines the POST route to add permissions to a user
router.post('/:id/permissions/add', async (req, res) => {
    
    // Finds the user by ID
    const user = await User.findOne({id: req.params.id})
    var newUser = user
    // Merges the new permissions with the existing ones
    newUser.permissions = u.mergeArrays(newUser.permissions, req.body.permissions)
    
    // If specified, updates the user's role based on permissions
    if(u.parseBool(req.query.updateRole) == true)
    {
        newUser.role = await u.updateRole(newUser)
    }

    try {
        // Updates the user's data in the database
        await User.findByIdAndUpdate(user._id, newUser, {new: true})
        .then(u => {
            // Sends a response indicating the permissions were added successfully
            res.status(200).send({
                status: 200,
                message: 'Permissions added',
                user: u
            })
        })
    } catch (error) {
        // Sends an error response if updating the user fails
        res.send(error)
    }
})

// Defines the POST route to remove permissions from a user
router.post('/:id/permissions/remove', async (req, res) => {
    // Finds the user by ID
    const user = await User.findOne({id: req.params.id})
    var newUser = user
    // Removes the specified permissions from the user's permissions
    newUser.permissions = u.diffArrays(newUser.permissions, req.body.permissions)
    
    // If specified, updates the user's role based on permissions
    if(u.parseBool(req.query.updateRole) == true)
    {
        newUser.role = await u.updateRole(newUser)
    }

    try {
        // Updates the user's data in the database
        await User.findByIdAndUpdate(user._id, newUser, {new: true})
        .then(u => {
            // Sends a response indicating the permissions were removed successfully
            res.status(200).send({
                status: 200,
                message: 'Permissions removed',
                user: u
            })
        })
    } catch (error) {
        // Sends an error response if updating the user fails
        res.send(error)
    }
})

// Exports the router to be used in other files
module.exports = router