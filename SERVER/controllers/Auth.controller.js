const User=require('../models/User.model')
const OTP=require('../models/OTP.model')
const otpGenerator=require('otp-generator')
const bcrypt=require('bcrypt')
const Profile= require('../models/Profile.model')
const jwt=require('jsonwebtoken')
require('dotenv').config();

//send otp
exports.sendOTP=async(req,res)=>{
    try {
        //fetch email from req body
    const {email}=req.body;

    //check if user already exist
    const checkUserPresent=await User.findOne({email});

    //id user exist then return a response
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'User already registered',
        })
    }

    //generate OTP
    let otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })
    console.log("otp generated",otp);

    //check unique otp or not 
    const result=await OTP.findOne({otp:otp});

    while(result){
        otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })
        console.log("otp generated",otp);
         //check unique otp or not 
     result=await OTP.findOne({otp:otp});
    }

    const otpPayload={email,otp}

    //create an entry in DB for otp

    const otpBody=await OTP.create(otpPayload)
    console.log(otpBody);

    // return response successfull
    res.status(200).json({
        success:true,
        message:'otp sent successfully',
        otp,
    })
    
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,

        })
    }
}

//sign up ❤️❤️

exports.signUp=async(req,res)=>{
   try {
     //data fetch from req body
     const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }=req.body;
    //validate data
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp || !contactNumber ) {
        return res.status(403).json({
            success:false,
            message:'all fields are required',
        })
    }
    //2 passwords match karlo
    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'password and confirmPassword value does not match, please try again',
        })
    };
    //check user already exist or not
    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(200).json({
            success:false,
            message:"User isAlready Registered "
        })
    }
    //find most recent OTP for the user
    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(
        recentOtp
    );
    //validate OTP
    if(recentOtp.length===0){
        //OTP not Found
        return res.status(400).json({
            success:false,
            message:"OTP  Found"
        })
    }
    else if(otp !==recentOtp){
        //invalid otp
        return res.status(400).json({
            success:false,
            message:"Invalid  OTP",
        });
    }


    //hash password
    const hashedPassword= await bcrypt.hash(password,10);

    //create an entery in db
    const profileDetails=await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });

    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    //return res
    return res.status(200).json({
        success:true,
        message:"user registered successfully",
        user,
    });
    
   } catch (error) {
    console.log(error.message);
    return res.status(500).json({
        success:false,
        message:"User cannot be registered , please try again "
    })
   }
}


//login 🌐🌐🌐🌐
exports.login=async(req,res)=>{
    try {
        //get data from req body
        const {email,passowrd}=req.body;
        //validation of data
        if(!email || !passowrd){
            return res.status(403).json({
                success:false,
                message:" all fileds are required please try again"
            });
        }
        //check user exist
        const user= await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signUp first",
            });
        }
        //generate jwt after password  matching

        if(await bcrypt.compare(passowrd,user.password)) {
            const payload= {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            };
            const token= jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token=token;
            user.password=undefined;
        

        //create cookie and send response
        const options={
            expiresIn:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true,
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            user,
            token,
            message:"Logged in successfully",

        });
    }
    else{
        return res.status(401).json({
            success:false,
            message:"password is incorrect"
        })
    }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"login failure , please try again  ",
        })
        
    }
}

//change password🚀🚀

exports.changePassword=async(req,res)=>{
    //get data from rq body
    //get old password , new password, confirm new password
    //validation
    

    //update password in Db
    //send mail=password updated
    //return response
}
