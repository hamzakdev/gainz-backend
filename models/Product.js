const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description:{
        type: String,
        required: [true, "Please enter product Description"]
    },
    price:{
        type: Number,
        required: [true, "Please enter product Price"],
        maxLength: [8, "price cant be more than 8 digits"]
    },
    ratings:{
        type: Number,
        default:0
    },
    images:Array,

    category:{
        type: String,
        required:[true, "please enter product category"]
    },
    stock:{
        type:Number,
        required:[true,"please enter product stock"],
        maxLength:[4, 'stocks cannot exceed 4 characters'],
        default: 1
    },
    numOfReviews:{
        type: Number,
        default: 0,
    },
    reviews:[{
        user:{
            type: mongoose.Schema.ObjectId,
            ref: "User",
            
        },
        name:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            required:true
        },
        comment:{
            type:String,
            required:true
        },
    }],
    
    
},{timestamps:true})

module.exports = mongoose.model('Product', productSchema)