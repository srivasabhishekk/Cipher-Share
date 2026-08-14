const crypto = require('node:crypto')

const keyGenerator = () => {
    console.log(crypto.randomBytes(32).toString('hex'))
}