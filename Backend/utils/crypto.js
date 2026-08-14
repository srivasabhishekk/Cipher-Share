require('dotenv').config()
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm'

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')

if(KEY.length !== 32){
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes')
}

function encrypt(text) {
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Everything needed for decryption is packed into one string
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

function decrypt(encryptedText) {
    // Take everything back apart
    const [ivHex, encryptedData, authTagHex] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(
        encryptedData,
        'hex',
        'utf8'
    );

    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = { encrypt, decrypt }
