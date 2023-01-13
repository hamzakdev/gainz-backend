const mongoose = require('mongoose');

const connectDatabase =async ()=>{
//    await mongoose.set('strictQuery', true)
try{

    await mongoose.connect(process.env.MONGO_URL)
    console.log('db connected')
}
catch(err){
    console.log(err)
}

    
}

module.exports = connectDatabase
