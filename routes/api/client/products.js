const router = require('express').Router()
const mw = require('../../../middlewares/middlewares.js')
const Product = require('../../../db/schemas/products.js')
const Offer = require('../../../db/schemas/offers.js')
const bcrypt = require('bcrypt')
const u = require('../../../utils/utils.js')

router.get('/', mw.session_auth, async (req, res) => {
    const user = await Product.find({creatorID: req.headers['x-user']})
    res.send(user)
})

router.post('/', mw.session_auth, async (req, res) => {
    var product = req.body.product
    var offer = req.body.offer

    product = u.restrictFields(product, [
        '_id',
        '__v',
        'creatorID',
        'createdAt',
        'status',
        'id'
    ])

    product.status = 'DRAFT'
    product.id = await u.uniqueProductID(7)
    product.createdAt = new Date(Date.now()).toISOString()
    product.creatorID = req.headers['x-user']

    product = await new Product(product)
    
    try {
    
        await product.save() // Then create an offer

        offer.productID = product.id
        offer = u.restrictFields(offer, [
            '_id',
            '__v',
            'createdAt',
            'status',
            'key'
        ])

        offer.status = 'ACTIVE'
        offer.key = await u.uniqueKey(8)
        offer.createdAt = new Date(Date.now()).toISOString()

        offer = await new Offer(offer)
        
        await offer.save()

        res.status(201).json({
            product: product,
            offer: offer
        })
        
    } catch (error) {
        res.send(error)
    }
})

router.patch('/:id', mw.session_auth, async (req, res) => {
    var updates = {}

    updates = u.restrictFields(updates, [
        '_id',
        '__v',
        'creatorID',
        'createdAt',
        'status',
        'id'
    ])

    try {
        await Product.findOneAndUpdate({id: req.params.id}, updates, {new: true})
        .then(r => {
            res.send(r)
        })
    } catch (error) {
        res.send(error)
    }
})

// Offers



module.exports = router