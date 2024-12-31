const router = require("express").Router()

router.get('/', (req, res) => {
    res.send('BKF get users')
})

router.post('/', (req, res) => {
    res.send('BKF post users')
})

router.put('/', (req, res) => {
    res.send('BKF put users')
})

router.delete('/', (req, res) => {
    res.send('BKF delete users')
})

module.exports = router