const router = require('express').Router()
const u = require('../../utils/utils.js')
const User = require('../../db/schemas/users.js')
const Role = require('../../db/schemas/roles.js')
const bcrypt = require('bcrypt')

router.get('/', async (req, res) => {
    const users = await User.find(req.query)
    res.status(200).send(users)
})

router.post('/', async (req, res) => {
    var userBody = req.body
    userBody.id = await u.uniqueID(8)
    userBody.password = bcrypt.hashSync(userBody.password, 10)

    await u.setRole(userBody)

    const user = await new User(userBody)
    try {
        await user.save()
        res.status(201).send({
            status:201,
            message: 'Created',
            user: user
        })
    } catch (error) {
        res.send(error)
    }
})

router.patch('/:id', async (req, res) => {
    var newData = {}
    for (const key in req.body) {
        if(key != '_id' && key != '__v' && key != 'role' && key != 'permissions')
        {
            newData[key] = req.body[key]
        }
    }

    await User.findOneAndUpdate({id: req.params.id}, newData, {new: true})
    .then(u => {
        res.status(200).send({
            status: 200,
            message:'User updated',
            user: u
        })
    })
})

router.post('/:id/role/:role', async (req, res) => {

    const user = await User.findOne({id: req.params.id})
    if(!user || user == null)
    {
        res.status(404).send({
            status:404,
            message:'User not found'
        }) 
    } else if(user != undefined  && user != null)
    {
        const role = await Role.findOne({name: req.params.role})
    
        if(!role || user == null)
        {
            res.status(404).send({
                status: 404,
                message: 'Role not found'
            })
        } else if(role != undefined && role != null)
        {
            try {
                await User.findOneAndUpdate({id: user.id}, {role: role.name}, {new: true})
                .then(u => {
                    res.status(200).send({
                        status: 200,
                        message: 'Role set',
                        user: u
                    })
                })
            } catch (error) {
                res.send(error)
            }
        }
    }
})

router.post('/:id/permissions/add', async (req, res) => {
    
    const user = await User.findOne({id: req.params.id})
    var newUser = user
    newUser.permissions = u.mergeArrays(newUser.permissions, req.body.permissions)
    
    if(u.parseBool(req.query.updateRole) == true)
    {
        newUser.role = await u.updateRole(newUser)
    }

    try {
        await User.findByIdAndUpdate(user._id, newUser, {new: true})
        .then(u => {
            res.status(200).send({
                status: 200,
                message: 'Permissions added',
                user: u
            })
        })
    } catch (error) {
        res.send(error)
    }
})

router.post('/:id/permissions/remove', async (req, res) => {
    const user = await User.findOne({id: req.params.id})
    var newUser = user
    newUser.permissions = u.diffArrays(newUser.permissions, req.body.permissions)
    
    if(u.parseBool(req.query.updateRole) == true)
    {
        newUser.role = await u.updateRole(newUser)
    }

    try {
        await User.findByIdAndUpdate(user._id, newUser, {new: true})
        .then(u => {
            res.status(200).send({
                status: 200,
                message: 'Permissions removed',
                user: u
            })
        })
    } catch (error) {
        res.send(error)
    }
})

module.exports = router