const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : [true, "Please enter your username"],
        unique : true
    },
    email : {
        type : String,
        required : [true, "Please add your email"],
        unique : true
    },
    password : {
        type : String,
        required : [true, "Please add your password"]
    },
}, {
    timestamps : true
})

module.exports = mongoose.model("User", userSchema)