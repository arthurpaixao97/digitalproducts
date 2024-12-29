const router = require('express').Router()
const u = require('../../utils/utils.js')
const Role = require('../../db/schemas/roles.js')
const bcrypt = require('bcrypt')

router.get('/', async (req, res) => {
    const roles = await Role.find(req.query)
    res.status(200).send(roles)
})

router.post('/', async (req, res) => {
    var roleBody = {
        name: req.body.name,
        permissions: req.body.permissions
    }
    const role = await new Role(roleBody)
    try {
        await role.save()
        res.status(201).send({
            status:201,
            message: 'Created',
            role: role
        })
    } catch (error) {
        res.send(error)
    }
})

router.delete('/', async (req, res) => {
    const role = await Role.findOneAndDelete(req.query)
    res.status(200).send({
        status:200,
        message: 'Deleted',
        role: role
    })
})

//Permissions API

router.post('/:role_name/permissions/add', async (req, res) => {
    const role = await Role.findOne({name: req.params.role_name})
    var newPermissions = req.body.permissions
    var finalPermissions = role.permissions

    if(!Array.isArray(newPermissions))
    {
        newPermissions = [
            newPermissions
        ]
    }
    newPermissions.forEach(np => {
        if(!role.permissions.find(p => p == np))
        {
            finalPermissions.push(np)
        }
    })

    try {
        await Role.findByIdAndUpdate(role._id, {permissions: finalPermissions}, {new: true})
        .then(r => {
            res.status(200).send({
                status: 200,
                message: 'Permissions added',
                role: r
            })
        })
    } catch (error) {
        res.send(error)
    }
})

router.post('/:role_name/permissions/remove', async (req, res) => {
    const role = await Role.findOne({name: req.params.role_name})
    var newPermissions = req.body.permissions
    var currentPermissions = role.permissions
    var finalPermissions = []

    if(!Array.isArray(newPermissions))
    {
        newPermissions = [
            newPermissions
        ]
    }
    currentPermissions.forEach(np => {
        if(!newPermissions.find(p => p == np))
        {
            finalPermissions.push(np)
        }
    })

    try {
        await Role.findByIdAndUpdate(role._id, {permissions: finalPermissions}, {new: true})
        .then(r => {
            res.status(200).send({
                status: 200,
                message: 'Permissions removed',
                role: r
            })
        })
    } catch (error) {
        res.send(error)
    }
})

module.exports = router