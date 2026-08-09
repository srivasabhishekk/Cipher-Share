const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    text : {
        type : String,
        required : true
    },
    expireAt: {
        type: Date,
        default: () => new Date(Date.now() + 12 * 60 * 60 * 1000),          
        index: {
                    expires: 0,
                    partialFilterExpression: { expireAt: { $exists : true } } 
                } 
    },
    viewOnce: {
        type: Boolean,
        default: false           
    },
})

module.exports = mongoose.model("Data", dataSchema)

