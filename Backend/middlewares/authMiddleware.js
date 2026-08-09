const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    // No token → allow request to continue
    if (!authHeader) {
        return next()
    }

    // Authorization header exists, but isn't a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Invalid authorization header'
        })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Invalid token'
        })
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