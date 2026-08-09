const dotenv = require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/authRoutes.js')
const secureRoutes = require('./routes/secureRoutes.js')
const dbConnection = require('./config/dbConnection')

const app = express()

// Database Connection
dbConnection()

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.get('/', (req, res)=>{
    res.json({message : "Welcome To CipherShare!"})
})

const port = process.env.PORT || 3001

app.listen(port, ()=>{
    console.log(`Server listening at ${port}`)
})
