const mongoose =require('mongoose')
require('dotenv').config();


exports.Dbconnect=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("Db connected successfully"))
    .catch((error)=>{
        console.log("error while connecting database")
        console.log(error);
        process.exit(1);
    })
}