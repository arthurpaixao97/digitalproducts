require('dotenv').config()
const router = require('express').Router()
const Session = require('../db/schemas/sessions.js')
const User = require('../db/schemas/users.js')
const uuid = require('uuid')
const bcrypt = require('bcrypt')
const mw = require('../middlewares/middlewares.js')

const DURATION = parseInt(process.env.DURATION)

router.get('/', async (req, res) => {
    const session = await Session.find(req.query)
    res.send(session)
})

router.post('/', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    if(user)
    {
        if(bcrypt.compareSync(req.body.password, user.password))
        {
            const session = {
                token: uuid.v4(),
                user: user.id,
                role: user.role,
                expires: new Date(new Date(Date.now() + DURATION).toISOString()).toISOString()
            }

            const checkSession = await Session.findOne({user: session.user, expires: {$gte: new Date().toISOString()}})
            
            if(checkSession)
            {
               await Session.findOneAndDelete({user: checkSession.user})    
            }

            const newSession = await new Session(session)
            await newSession.save()
            .then(r => {
                res.send(r)
            })

        } else
        {
            res.status(401).send({
                status: 401,
                message:'Credenciais inválidas'
            })
        }
    } else
    {
        res.status(404).send({
            status:404,
            message:'Usuário não encontrado'
        })
    }
})

module.exports = router