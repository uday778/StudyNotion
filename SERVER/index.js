const express=require('express');
const app = express();
const Dotenv=require("dotenv")
Dotenv.config()

const userRoutes=require('./routes/User');
const profileRoutes=require('./routes/Profile.js')
const paymentRoutes=require('./routes/Payments');
const courseRoutes=require('./routes/Course');

//database
const database= require("./config/database");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const {cloudinaryConnect}=require("./config/cloudinary");
const fileUpload=require("express-fileupload");

const PORT=process.env.PORT || 4000;
//database connect
database.Dbconnect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        Credential:true,

    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/temp",
    })
)
//cloudinary connectiom
cloudinaryConnect();

//routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/course",courseRoutes);


//default route
app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and Running"
    })
})

app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`);
})
