const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

const userRegister = async (req, res) => {

    try{
        const { username, email, password } = req.body

        if(!username || !email || !password){
            return res.status(400).json({ message : "All Fields are mandatory!" })
        }

        const existingUser = await User.findOne({ 
            $or : [{ username }, { email }]
        })

        if(existingUser){
            return res.status(409).json({
                message : "User already Registered"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            username,
            email,
            password : hashedPassword
        })

        const token = jwt.sign({id : user._id, username : user.username}, process.env.JWT_SECRET_TOKEN, {expiresIn : "1d"})

        res.cookie("token", token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge : 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message : `User registered with username ${user.username}`,
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            }
        })
    }catch(error){
        console.log(error)
        res.status(500).json({message : `Something went wrong`})
    }
}

const userLogin = async (req, res) =>{
    try{
        const { username, password } = req.body

        if(!username || !password){
            return res.status(400).json({ message : "All Fields are mandatory!"})
        }

        const user = await User.findOne({ username })

        if(!user){
            return res.status(404).json({
                message : "User not found!"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(401).json({message : "Invalid username or password"})
        }

        const token = jwt.sign({id : user._id, username : user.username}, process.env.JWT_SECRET_TOKEN, {expiresIn : "1d"})

        res.cookie("token", token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge : 24 * 60 * 60 * 1000
        })

        res.status(200).json({ 
            message : "User logged in successfully.",
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            }
         })
    }catch(error){
        console.log(error)
        res.status(500).json({message : "Something went wrong, retry after some time"})
    }
}

const getMe = async (req , res) => {
    if(req.user){
        const user = req.user
        return res.status(200).json({
            message : `Hello, ${user.username}`
        })
    }

    return res.status(200).json({
        message : 'Hello, Guest!'
    })
}

const resetPassword = async(req, res) => {
    const { username, password, newPassword } = req.body

    if(!username || !password || !newPassword){
        return res.status(400).json({
            message : "All fields are mandatory!"
        })
    }

    const user = await userModel.findOne({ username })

    if(!user){
        return res.status(400).json({
            message : "User not registered with this username!"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return res.status(401).json({
            message :"Invalid username or password!"
        })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    await user.save()

    return res.status(200).json({
        message : "Password changed successfully! Login to continue."
    })
}

const userLogout = async(req, res) => {
    const token = req.cookies.token

    res.clearCookie("token")

    res.status(200).json({
        message : "User logged out successfully."
    })
}



module.exports = { userRegister, userLogin, getMe, resetPassword, userLogout}