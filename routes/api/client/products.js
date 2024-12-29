const router = require('express').Router()
const mw = require('../../../middlewares/middlewares.js')
const Product = require('../../../db/schemas/products.js')
const bcrypt = require('bcrypt')
const u = require('../../../utils/utils.js')

router.get('/', mw.session_auth, async (req, res) => {
    const user = await Product.find({creatorID: req.headers['x-user']})
    res.send(user)
})

router.post('/', async (req, res) => {
    var product = req.body
    
    product.id = await u.uniqueID(7)
    product = await new Product(product)
    try {
        await product.save()
        .then(r => {
            res.send(r)
        })   
    } catch (error) {
        res.send(error)
    }
})

router.patch('/', mw.session_auth, async (req, res) => {
    var updates = {}

    if(req.body.name != undefined) updates.name = req.body.name
    if(req.body.email != undefined) updates.email = req.body.email
    if(req.body.password != undefined) updates.password = bcrypt.hashSync(req.body.password, 10)

    try {
        await User.findOneAndUpdate({id: req.headers['x-user']}, updates, {new: true})
        .then(r => {
            res.send(r)
        })
    } catch (error) {
        res.send(error)
    }
})

module.exports = router