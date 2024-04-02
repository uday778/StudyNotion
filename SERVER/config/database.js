const mongoose =require('mongoose')
require('dotenv').config();


exports.Dbconnect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=>console.log("Db connected successfully"))
    .catch((error)=>{
        console.log("error ehile connecting database")
        console.error(error);
        process.exit(1);
    })
}