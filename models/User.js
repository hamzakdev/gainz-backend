const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter your name"],
        maxLength: [30, "Name cannot exceed 30"],
        minLength: [4, "Name must be atleast 4 characters"],
    },
    email: {
        type: String,
        required: [true, "Enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Enter your password"],
        minLength: [8, "Password must be atleast 8 characters"],
    },
    profilePic: String,
    
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,



}, { timestamps: true })

//GENERATING HASHED PASSWORD

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
//GENERATING JSONWEBTOKEN
userSchema.methods.getJWTToken =  function (){
 return jwt.sign({id: this._id}, process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE})
 
}

//COMPARING HASHED PASSWORD

userSchema.methods.passwordCompare =async function (enteredPassword){
 return await bcrypt.compare(enteredPassword, this.password)
 
}


// IMPLEMENTING PASSWORD RESET

    userSchema.methods.generateResetPassword = async function (){
        //random token

        const resetToken = crypto.randomBytes(20).toString('hex')

        this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        // 900000 miliseconds = 15 minutes
        this.resetPasswordExpire = Date.now() + 900000;

        return resetToken
    }

module.exports = mongoose.model('User', userSchema)