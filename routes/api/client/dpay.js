require('dotenv').config()
const router = require('express').Router()
const { response } = require('express')
const Transaction = require('../../../db/schemas/transactions')
const User = require('../../../db/schemas/users')
const mw = require('../../../middlewares/middlewares')
const u = require('../../../utils/utils')

const GATEWAY = process.env.GATEWAY_ENDPOINT

router.get('/transactions', mw.session_auth, async (req, res) => {
    var query = u.restrictFields(req.query, [
        'buyer'
    ])
    query.buyer = {}
    const user = await User.findOne({id: req.headers['x-user']})
    query.buyer.email = user.email
    console.log(query)
    const transactions = await Transaction.find(query)
    res.status(200).send(transactions)
})

router.post('/transactions/new', async (req, res) => {

    var transaction = u.restrictFields(req.body.transaction, [        
        '_id',
        '__v',
        'id'
    ])

    transaction.id = await u.uniqueTransID(10)

    var status = 0

    await fetch(GATEWAY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            transaction: transaction,
            payment: req.body.payment
        })
    })
    .then(r => {
        status = r.status
        return r.json()
    })
    .then(r => {
        transaction.status = r.orderStatus
    })
    .catch(e => {
        status = 500
        transaction.status = 'Gateway internal server error'
    })
   
    if(parseInt(status.toString()[0]) !== 2)
    {
        res.status(status).send(`${status} - ${transaction.status}`)
    } else
    {
        const newTrans = await new Transaction(transaction)
        try {
            await newTrans.save()
            res.status(status).send(newTrans)
        } catch (error) {
            res.status(status).send(error)   
        }
    }
})

module.exports = router