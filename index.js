const express = require('express');
const app = express();
const dotenv = require('dotenv').config()
const productRoute = require('./routes/product')
const userRoute = require('./routes/user')
const connectDatabase = require('./db')
const ErrorMiddleware = require('./middlewares/error')
const AsyncErrorsMiddleware = require('./middlewares/asyncErrors');
const cookieParser = require('cookie-parser');
const cors = require('cors')



//connecting to database : 
connectDatabase().then(app.listen(process.env.PORT, ()=>{
    console.log('server is running')
}))
  app.use((req,res,next)=>{
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    // res.header('Access-Control-Allow-Headers', 'Content-Type');

    next()
    })





//config :

// dotenv.config({path: "config.env"});
app.use(express.json());
app.use(cookieParser())



//routes : 

app.use('/api/products', productRoute);
app.use('/api/users', userRoute);


//error handling :
app.use(ErrorMiddleware)
app.use(AsyncErrorsMiddleware)


