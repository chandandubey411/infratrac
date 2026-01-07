const mongoose = require('mongoose');
require('dotenv').config();

const connectDB= async()=>{
    try{
        const connect = await mongoose.connect(process.env.mongoURI);
        console.log("mongoDB Connected");
    }catch(err){
        console.log(err);
    }
}

module.exports = connectDB;