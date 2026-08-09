const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const token = req.cookies.token

    // No token → allow request to continue
    if (!token) {
        return next()
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_TOKEN
        )

        req.user = decoded

        return next()

    } catch (err) {
        console.error('Token verification failed:', err.message)

        return res.status(401).json({
            message: 'Invalid or expired token'
        })
    }
}

module.exports = verifyToken