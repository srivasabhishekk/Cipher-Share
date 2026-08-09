const mongoose = require('mongoose');
const commonConfigs = require('../commonConfig.json')

const dbConnection = async () => {
    try{
        if(!process.env.CONNECTION_STRING){
            throw new Error('CONNECTION_STRING environment variable not set.')
        }

        const uri = `${process.env.CONNECTION_STRING}/${commonConfigs.applicationName}`

        const connect = await mongoose.connect(uri)

        console.log(`MongoDB connected : ${connect.connection.host}, ${connect.connection.name}`)
    }catch(err){
        console.log(`MongoDB connection error:`, err.message)

        process.exit(1)
    }
}

module.exports = dbConnection