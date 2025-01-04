const router = require('express').Router()
const mw = require('../../middlewares/middlewares.js')

const users = require('./client/users.js')
const products = require('./client/products.js')
const dpay = require('./client/dpay.js')

router.use('/users', users)
router.use('/products', products)
router.use('/dpay', dpay)

module.exports = router