// Import the required modules
const router = require('express').Router()     // Express router for handling requests
const User = require('../../../db/schemas/users.js') // User schema for interacting with the users collection
const bcrypt = require('bcrypt')               // Library for password hashing (not used in this snippet but imported)
const mw = require('../../../middlewares/middlewares.js')
const u = require('../../../utils/utils.js')

// Defines the GET route to fetch users based on query parameters
router.get('/', async (req, res) => {
    // Finds users based on the query parameters from the request
    const users = await User.find(req.query)
    
    // Sends the retrieved users as a response
    res.send(users)
})

router.patch('/:id/change/email', mw.permissions('change_email'), async (req, res) => {
    try {
        await User.findOneAndUpdate({id: req.params.id}, {email: req.body.new_email}, {new: true})
        .then(u => {
            res.status(200).send({
                status:200,
                message:'E-mail de usuário atualizado com sucesso',
                user: u
            })
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/:id/sanctions/add', mw.permissions('change_sanctions'), async (req, res) => {
    try {
        const user = await User.findOne({id: req.params.id})
        var newSanctions = u.mergeArrays(u.toArray(user.sanctions), u.toArray(req.body.sanctions))
        await User.findOneAndUpdate({id: req.params.id}, {sanctions: newSanctions}, {new: true})
        .then(u => {
            res.status(200).send({
                status:200,
                message:'Sanções adicionadas com sucesso',
                user: u
            })
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/:id/sanctions/remove', mw.permissions('change_sanctions'), async (req, res) => {
    try {
        const user = await User.findOne({id: req.params.id})
        var newSanctions = u.diffArrays(u.toArray(user.sanctions), u.toArray(req.body.sanctions)).result1
        console.log(newSanctions)
        await User.findOneAndUpdate({id: req.params.id}, {sanctions: newSanctions}, {new: true})
        .then(u => {
            res.status(200).send({
                status:200,
                message:'Sanções removidas com sucesso',
                user: u
            })
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

// Exports the router to be used in other files
module.exports = router