const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/authMiddleware')
const { encryptionFunction }= require('../controllers/mainController')
const { decryptionFunction } = require('../controllers/mainController')

router.post('/encrypt', verifyToken, encryptionFunction)

router.get('/decrypt/:id', decryptionFunction)

module.exports = router