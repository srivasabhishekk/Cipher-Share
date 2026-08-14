const express = require('express')
const router = express.Router()
const { userRegister, userLogin, getMe, resetPassword, userLogout } = require('../controllers/authController')
const verifyToken = require('../middlewares/authMiddleware')

router.post('/register', userRegister)

router.post('/login', userLogin)

router.get('/logout', userLogout)

router.post('/reset-password', resetPassword)

router.get('/get-me', verifyToken, getMe)

module.exports = router