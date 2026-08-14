const { encrypt, decrypt } = require('../utils/crypto')
const Data = require('../models/dataModel')
const mongoose = require('mongoose')

const encryptionFunction = async (req, res) => {
    try{
        const { text, time, viewOnce } = req.body

        if(!text){
            return res.status(400).json({ message : "Text not provided for encryption!" })
        }

        if(typeof viewOnce !== 'boolean'){
            return res.status(400).json({
                message : "viewOnce must be true or false"
            })
        }

        let expiryTime, encryptedText, generatedLink

        if(viewOnce === false){
            if(!time){
                return res.status(400).json({
                    message : "Time is mandatory when view once is false"
                })
            }

            if(!req.user){
                if(time === 'one day' || time === 'one week'){
                    return res.status(400).json({
                        message : "Login for longer expiry time."
                    })
                }
            }

            if(!req.user){
                expiryTime = new Date(Date.now() + 60 * 60 * 1000)
            }else{
                switch(time){
                    case "one hour" : 
                        expiryTime = new Date(Date.now() + 60 * 60 * 1000)
                        break
                     
                    case "one day" : 
                        expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
                        break    

                    case "one week" :
                        expiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        break
                    
                    default : 
                        return res.status(400).json({
                            message : "Invalid expiry time"
                        })
                }
            }

            encryptedText = encrypt(text)

            const data = await Data.create({
                text : encryptedText,
                expireAt : expiryTime,
                viewOnce
            })

            generatedLink = `${process.env.BASE_URL}/secure/decrypt/${data._id}`

            return res.status(201).json({
                message : req.user
                    ? "Text Encrypted Successfully!"
                    : "Text encrypted successfully! Login for longer expiry.",
                link : generatedLink,
            })
        }

        encryptedText = encrypt(text)

        const data = await Data.create({
            text : encryptedText,
            viewOnce
        })

        generatedLink = `${process.env.BASE_URL}/secure/decrypt/${data._id}`

        return res.status(201).json({
            message : 'Text encrypted successfully (view-once)',
            link : generatedLink,
        })

    }catch(error){
        console.error(error.message, error.stack)

        return res.status(500).json({
            message : 'Internal Server Error'
        })
    }
}


const decryptionFunction = async(req, res) => {
    try{
        const { id } = req.params

        if(!id){
            return res.status(400).json({
                message : 'Missing document id!'
            })
        }

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message : 'Invalid document id!'
            })
        }

        let data

        const existingData = await Data.findById(id)

        if(!existingData){
            return res.status(404).json({
                message : 'Encrypted text not found or already used'
            })
        }

        if(existingData.expireAt && existingData.expireAt < Date.now()){
            await Data.deleteOne({ _id : existingData._id })

            return res.status(410).json({
                message : 'This link has expired'
            })
        }

        if(existingData.viewOnce === true){
            data = await Data.findOneAndDelete({
                _id : id,
                viewOnce : true
            })

            if(!data){
                return res.status(404).json({
                    message : 'Encrypted text not found or already used'
                })
            }
        }else{
            data = existingData
        }

        let decryptedText

        try{
            decryptedText = decrypt(data.text)
        }catch{
            return res.status(500).json({
                message : 'Text Decryption Failed!'
            })
        }

        return res.status(200).json({
            message : "Text decrypted successfully!",
            text : decryptedText
        })

    }catch(err){
        console.error(err.message, err.stack)

        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

module.exports = {
    encryptionFunction,
    decryptionFunction
}