const asyncErrors = require("../middlewares/asyncErrors");
const User = require("../models/User");
const ErrorHandler = require("../utilities/error");
const sendEmail = require('../utilities/sendEmail')
const router = require("express").Router();
const crypto = require('crypto');
const { verifyToken, isAdmin } = require("../middlewares/auth");

//REGISTER A NEW USER

router.post(
  "/register",
  asyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      profilePic:req.body.profilePic ,
        
    });
    const token = user.getJWTToken();
    const options = {
      httpOnly: true,
      expires: new Date(Date.now() + 86400000 * 5),
    };

    res
      .status(201)
      .cookie("token", token, options)
      .json({ success: true, token });
  })
);


//LOGIN A USER


router.post(
  "/login",
  asyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("email or pass required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("wrong credentials", 401));
    }

    const passCheck = await user.passwordCompare(password);
    if (!passCheck) { 
      return next(new ErrorHandler("wrong credentials", 401));
    }

    const token = user.getJWTToken();

    const options = {
      httpOnly: true,
      expires: new Date(Date.now() + 86400000 * 5),
    };
	const {isAdmin} = user._doc
    res
      .status(200)
      .cookie("token", token, options)
      .json({ token, isAdmin});
  })
);

//LOGOUT A USER

router.get('/logout', asyncErrors((req,res,next)=>{

    res.cookie('token', null, {expires:new Date(Date.now()), httpOnly:true})

    res.status(200).json("LOGGOUT OUT")
}))


//SEND FORGOT PASSWORD EMAIL USING NODEMAILER

router.post('/forgot', asyncErrors(async(req,res,next)=>{
  const user = await User.findOne({email:req.body.email})

  if(!user) return next(new ErrorHandler("User Does not exist", 404))

 const resetToken = await user.generateResetPassword()

await user.save({validateBeforeSave:false});

const resetPasswordURL = `${req.get('host')}/api/users/reset/${resetToken}`
const message = `Your password reset token is : \n\n\n ${resetPasswordURL}`

try{


  await sendEmail({
    email: user.email,
    subject: "E-Shop Password Reset",
    message

  })

  res.status(200).json('email send to ' + user.email)
}catch(err){
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()
  return next(new ErrorHandler(err, 500))
}



}))


//RESET PASSWORD

router.put('/reset/:token', asyncErrors(async(req,res,next)=>{
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now() }
  })

  if(!user){
    return next(new ErrorHandler('token is invalid or expired', 404))
  }

  if(req.body.password !== req.body.confirmPassword) return next(new ErrorHandler('Passwords does not match', 400))

  user.password = req.body.password
  user.resetPasswordExpire = undefined
  user.resetPasswordToken = undefined

  await user.save()
  const token = user.getJWTToken();
  res.status(200).json({success:true , message: "Succesfully updated the password"})
}))


//GET USER DETAILS

router.get('/', verifyToken , asyncErrors(async(req,res,next)=>{
  const user = await User.findById(req.user.id)

  if(!user)return next(new ErrorHandler("user does not exist", 404))

  const {password, ...others }= user._doc

  res.status(200).json({success:true, others});
}))
//GET ADMIN DETAILS

router.get('/admin', verifyToken , isAdmin, asyncErrors(async(req,res,next)=>{
  const user = await User.findById(req.user.id)

  if(!user)return next(new ErrorHandler("user does not exist", 404))

  const {password, isAdmin, ...others }= user._doc

  res.status(200).json({success:true,isAdmin, others});
}))

//Update User Password


router.put('/password/update', verifyToken,  asyncErrors(async(req,res,next)=>{
  const user = await User.findById(req.user.id)
  if(!user)return next(new ErrorHandler("user does not exist", 404))
  
  const passwordCompare = await user.passwordCompare(req.body.oldPassword ) 
  if(!passwordCompare) return next(new ErrorHandler("Old Password is incorrect", 400))

  if(req.body.password !== req.body.confirmPassword) return next(new ErrorHandler("Passwords do not match", 400))
  user.password = req.body.password
  await user.save()
  res.status(200).json({success:true, messsage:"Password Changed", })


}))

//UPDATE PROFILE

router.put('/update', verifyToken, asyncErrors(async(req, res,next)=>{

  const newUser = {
    name:req.body.name,
    email:req.body.email,
    profilePic:req.body.profilePic
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUser, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({success:true, message:"Profile updated", user})
})
  
)

//DELETE PROFILE

router.put('/delete', verifyToken, asyncErrors(async(req, res,next)=>{


  const user = await User.findByIdAndDelete(req.user.id)
  
  res.status(200).json({success:true, message:"Profile deleted"})
})
  
)

//GET ALL USERS - Admin Only

router.get('/all', verifyToken, isAdmin , asyncErrors(async(req,res,next)=>{
  const users = await User.find();

  res.status(200).json(users)
}))

//GET A  SINGLE USER - Admin Only
router.get('/single/:id', verifyToken, isAdmin , asyncErrors(async(req,res,next)=>{
  const user = await User.findById(req.params.id)

if(!user)return next(new ErrorHandler('user does not exist'),)
  res.status(200).json({success:true, user})
}))

//UPDATE USER ACCESS -- Admin

router.put('/updaterole/:id', verifyToken, isAdmin , asyncErrors(async(req, res,next)=>{

 

  const user = await User.findByIdAndUpdate(req.params.id, {role:req.body.role,}, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
if(!user)return next(new ErrorHandler('user does not exist'),)
  

  res.status(200).json({success:true, message:`${user.name}'s role is changed to ${user.role}`})
})
  
)




module.exports = router;
  