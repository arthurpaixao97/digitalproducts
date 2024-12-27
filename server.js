require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mw = require('./middlewares/middlewares.js')

PORT = process.env.PORT
DB_USERNAME = process.env.DB_USERNAME
DB_PASSWORD = process.env.DB_PASSWORD

const app = express()
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())
app.use(mw.refreshSessions)

const viewsRouter = require('./routes/views.js')
const apiRouter = require('./routes/api.js')
const authRouter = require('./routes/auth.js')

app.use('/', viewsRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)

app.listen(PORT, ()=> {
    mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@digital-products.nhwfl.mongodb.net/?retryWrites=true&w=majority&appName=digital-products`);
    console.log(`Server running on port ${PORT}`)
})