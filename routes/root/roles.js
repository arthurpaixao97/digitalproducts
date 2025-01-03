// Imports the Express router
const router = require('express').Router()

// Imports utility functions
const u = require('../../utils/utils.js')

// Imports the Role schema for interacting with the roles collection in the database
const Role = require('../../db/schemas/roles.js')

// Imports bcrypt for password hashing (though it's not used in this specific code)
const bcrypt = require('bcrypt')

// Defines the GET route to retrieve roles from the database
router.get('/', async (req, res) => {
    // Fetches roles from the database based on the query parameters
    const roles = await Role.find(req.query)
    
    // Sends the retrieved roles as a response
    res.status(200).send(roles)
})

// Defines the POST route to create a new role
router.post('/', async (req, res) => {
    // Constructs the role object from the request body
    var roleBody = {
        name: req.body.name,
        permissions: req.body.permissions
    }

    // Creates a new Role instance
    const role = await new Role(roleBody)
    
    try {
        // Saves the new role to the database
        await role.save()
        
        // Sends a response indicating the role was created successfully
        res.status(201).send({
            status: 201,
            message: 'Created',
            role: role
        })
    } catch (error) {
        // Sends an error response if saving the role fails
        res.send(error)
    }
})

// Defines the DELETE route to delete a role
router.delete('/', async (req, res) => {
    // Finds and deletes a role based on query parameters
    const role = await Role.findOneAndDelete(req.query)
    
    // Sends a response indicating the role was deleted
    res.status(200).send({
        status: 200,
        message: 'Deleted',
        role: role
    })
})

router.post('/copy/:name', async (req, res) => {
    const role = await Role.findOne({name: req.params.name})
    var newRole = {
        permissions: role.permissions
    }
    var unique = false
    if(!(req.body.copy_name != undefined && req.body.copy_name != '' && req.body.copy_name != null))
    {
        const newRoles = await Role.find({name: `${role.name}_COPY`})
        if(newRoles.length == 0)
        {
            unique = true
            newRole.name = `${role.name}_COPY`
        }
        var copycount = 2
        while(unique == false)
        {
            const copies = await Role.find({name: `${role.name}_COPY_${copycount}`})
            if(copies.length > 0)
            {
                copycount++
            } else {
                unique = true
                newRole.name = `${role.name}_COPY_${copycount}`
            }
        }
    } else
    {
        const checkName = await Role.find({name: req.body.copy_name})
        if(checkName.length > 0)
        {
            res.status(400).send({
                status:400,
                message:'Nome da cópia já existe como Role'
            })
        } else
        {
            newRole.name = req.body.copy_name
        }
    }

    
    const copyRole = await new Role(newRole)
    try {
        await copyRole.save()
        res.status(201).send({
            status:201,
            message:`Role ${role.name} copiado com sucesso para ${copyRole.name}`,
            role: copyRole
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

// **Permissions API**

router.post('/:role_name/permissions/add', async (req, res) => {
    // Finds the role by its name
    const role = await Role.findOne({name: req.params.role_name})
    
    // Extracts new permissions from the request body
    var newPermissions = req.body.permissions
    var finalPermissions = role.permissions

    // Ensures newPermissions is an array
    if(!Array.isArray(newPermissions))
    {
        newPermissions = [newPermissions]
    }

    // Adds new permissions to the role if they don't already exist
    newPermissions.forEach(np => {
        if(!role.permissions.find(p => p == np))
        {
            finalPermissions.push(np)
        }
    })

    try {
        // Updates the role's permissions in the database
        await Role.findByIdAndUpdate(role._id, {permissions: finalPermissions}, {new: true})
        .then(r => {
            // Sends a response indicating permissions were successfully added
            res.status(200).send({
                status: 200,
                message: 'Permissions added',
                role: r
            })
        })
    } catch (error) {
        // Sends an error response if updating the role fails
        res.send(error)
    }
})

router.post('/:role_name/permissions/remove', async (req, res) => {
    // Finds the role by its name
    const role = await Role.findOne({name: req.params.role_name})
    
    // Extracts permissions to be removed from the request body
    var newPermissions = req.body.permissions
    var currentPermissions = role.permissions
    var finalPermissions = []

    // Ensures newPermissions is an array
    if(!Array.isArray(newPermissions))
    {
        newPermissions = [newPermissions]
    }

    // Removes the specified permissions from the role
    currentPermissions.forEach(np => {
        if(!newPermissions.find(p => p == np))
        {
            finalPermissions.push(np)
        }
    })

    try {
        // Updates the role's permissions in the database
        await Role.findByIdAndUpdate(role._id, {permissions: finalPermissions}, {new: true})
        .then(r => {
            // Sends a response indicating permissions were successfully removed
            res.status(200).send({
                status: 200,
                message: 'Permissions removed',
                role: r
            })
        })
    } catch (error) {
        // Sends an error response if updating the role fails
        res.send(error)
    }
})

// Exports the router to be used in other files
module.exports = router