const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.Authorization || req.headers.authorization

        if (authHeader && authHeader.startsWith("Bearer")) {
            const token = authHeader.split(" ")[1]

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
                req.user = decoded
                console.log(req.user)
                next()
            } else {
                return res.status(401).json({ message: "Invalid Token" })
            }
        } else {
            return res.status(401).json({ message: "Invalid Token" })
        }

    } catch (err) {
        console.error('Unexpected error in token verification middleware:', err.message)
        return res.status(500).json({ message: 'Internal server error.' })
    }
}

module.exports = verifyToken