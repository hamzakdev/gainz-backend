const ErrorHandler = require("../utilities/error");
const asyncErrors = require("./asyncErrors");
const jwt = require('jsonwebtoken');
const User = require("../models/User");

exports.verifyToken = asyncErrors(async(req,res,next)=>{

    const {token} = req.cookies

    if(!token){
        return next(new ErrorHandler("no token found", 401))
    }
     const data =  jwt.verify(token, process.env.JWT_SECRET)

    req.user =  await User.findById(data.id)
    next()
})

exports.isAdmin= (req,res,next)=>{
    if(!req.user.isAdmin){
        return next(new ErrorHandler(`${req.user.name} you're not authorized`, 401))
    }
    next()

}

// module.exports = verifyAdmin 