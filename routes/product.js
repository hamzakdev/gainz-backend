const router = require("express").Router();
const asyncErrors = require("../middlewares/asyncErrors");
const {verifyToken,isAdmin} = require("../middlewares/auth");
const Product = require("../models/Product");
const ErrorHandler = require("../utilities/error");
const Features = require("../utilities/features");

// CREATE A NEW PRODUCT -- ADMIN ONLY
router.post(
  "/new",
  verifyToken,
  isAdmin,
  asyncErrors(async (req, res, next) => {
req.body.user = req.user.id
    const product = await Product.create(req.body);

    res.status(200).json({ success: true, product });
  })
);

//GET ALL PRODUCTS

router.get("/",  asyncErrors(async (req, res, next) => {

    const resultperPage = 10
    const productCount = await Product.countDocuments()
    const features = new Features(Product.find().sort({createdAt: -1}), req.query)
    .search()
    .filter()
    .pagination(resultperPage)
    const products = await features.query;
    res.status(200).json({ success: true, products, productCount,resultperPage });
  })
);
//GET ALL PRODUCTS- Admin

router.get("/count",  asyncErrors(async (req, res, next) => {
    const productAmount = await Product.countDocuments()
    res.status(200).json({ success: true, productAmount });
  })
);
//UPDATE A PRODUCT -- Admin Only

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  asyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({ success: true, product });
  })
);
//DELETE A PRODUCT -- Admin Only

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  asyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    await product.remove();

    res
      .status(200)
      .json({
        success: true,
        message: `Product with Id : ${product._id} has been deleted`,
      });
  })
);

// GET  A SINGLE PRODUCT

router.get(
  "/:id",
  asyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({ success: true, product });
  })
);



//ADD A REVIEW -- LOGIN REQUIRED


router.post('/review/add', verifyToken, asyncErrors(async(req,res,next)=>{

  const review ={
    user: req.user.id,
    name:req.user.name,
    rating:Number(req.body.rating),
    comment:req.body.comment,
  }

const product = await Product.findById(req.body.productId)

const reviewed = product.reviews.find(r=>r.user.toString() === req.user.id.toString())
if(reviewed){
  product.reviews.map(rev=>{
  if(rev.user.toString() === req.user.id.toString() )
  (rev.rating=req.body.rating),
  (rev.comment=req.body.comment);
  })
}
else{
  product.reviews.push(review)
  product.numOfReviews = product.reviews.length 
}
let avg = 0;

product.reviews.forEach((r)=>{
  avg += r.rating
})

product.ratings = avg/product.reviews.length 

await product.save({validateBeforeSave:false});

res.status(200).json({success: true, message :"review added"})

}))

// Get Product Reviews


router.get('/reviews', asyncErrors(async(req,res,next)=>{
  const product = await Product.findById(req.query.id);

  if(!product) return next(new ErrorHandler("Product does not exist", 404))

  res.status(200).json({success:true, reviews:product.review})

}))

module.exports = router;
