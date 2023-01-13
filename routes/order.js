const router = require("express").Router();
const asyncErrors = require("../middlewares/asyncErrors");
const ErrorHandler = require("../utilities/error");
const Product = require("../models/Product");
const Order = require("../models/Order");
const {verifyToken,isAdmin} = require("../middlewares/auth");


//NEW ORDER

router.post(
  "/new",
  verifyToken,
  asyncErrors(async (req, res, next) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      ItemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        ItemsPrice,
        shippingPrice,
        totalPrice,
        paidAt :Date.now(),
        user:req.user.id
        
    });
    res.status(201).json({success:true,order})
})
);


//GET AN ORDER -ADMIN

router.get('/single/:id', verifyToken,isAdmin, asyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if(!order) return next(new ErrorHandler("order not found", 404))

    res.status(200).json({success:true, order})
}))
//GET MY ORDERS -LOGIN

router.get('/me/all',verifyToken, asyncErrors(async(req,res,next)=>{
    const orders = await Order.find({user: req.user.id })
    res.status(200).json({success:true, orders})
    console.log('ers')
}))

module.exports = router;
