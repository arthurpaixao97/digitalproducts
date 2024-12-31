require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mw = require('./middlewares/middlewares.js')

// Load environment variables
PORT = process.env.PORT
DB_USERNAME = process.env.DB_USERNAME
DB_PASSWORD = process.env.DB_PASSWORD
RC_SECRET = process.env.RC_SECRET // Secret for root authentication, may change

const app = express()

// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'))

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Middleware for parsing cookies
app.use(cookieParser())

// Custom middleware for refreshing sessions
app.use(mw.refreshSessions)

// Import route handlers
const viewsRouter = require('./routes/views.js')
const apiRouter = require('./routes/api.js')
const authRouter = require('./routes/auth.js')
const rootRouter = require('./routes/root.js')

// Route configuration
app.use('/', viewsRouter) // Routes for serving views
app.use('/api', apiRouter) // Routes for API endpoints
app.use('/auth', authRouter) // Routes for authentication

// Routes with root authorization middleware
app.use('/root', mw.root_auth(RC_SECRET), rootRouter)

// Start the server and connect to the database
app.listen(PORT, ()=> {
    mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@digital-products.nhwfl.mongodb.net/?retryWrites=true&w=majority&appName=digital-products`);
    console.log(`Server running on port ${PORT}`)
})