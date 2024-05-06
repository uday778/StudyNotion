const User= require('../models/User.model');
const mailSender= require('../utils/mailSender')
const bcrypt= require('bcrypt');
const crypto=require("crypto")


//reset password token
exports.resetPasswordToken= async(req,res)=>{
    try {
        //get email from req body
    const {email}=req.body;

    //check user  for this email, email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(403).json({
            success: false,
            message:`This Email: ${email} is not Registered With Us Enter a Valid Email `
        });
    }
    //generate token
    const token= crypto.randomBytes(20).toString("hex");
    // update user by adding token and expiration time
    const updatedDetailes= await User.findOneAndUpdate (
        {email:email},
        {
            token:token,
            resetPasswordExpires:Date.now()+3*60*60*1000,
        },
        {new: true},
        
    )
    console.log("Details",updatedDetailes);
    //create url 
     const url=`http//localhost:4000/update-password/${token}`
    // send mail containing urll
    await mailSender(
        email,
        "password Reset Link", 
        `Your Link for email verification is   ${url}  . Please click this url to reset your password.`
    )
    // return Response
    return res.status(200).json({
        success: true,
        message:"Email Sent Successfully, Please Check Your Email to Continue Further"
    });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:`Some Error in Sending the Reset Message`,
            error:error.message,
        })
    }
 
}

//resetpassword -db updation

exports.resetPassword=async(req,res)=>{
   try {
     //data fetch
     const{password,confirmPassword,token}=req.body
     //validation
     if(password !== confirmPassword){
         return res.status(403).json({
             success: false,
             message: "Password and Confirm Password Does not Match"
         });
     }
     //get userdetails from db using token
     const userdetails= await User.findOne({token:token});
 
     //if no entry--invalid token
     if(!userdetails){
         return res.status(401).json({
             success: false,
             message:"Token is invalid"
         })
     }
     //token time check
     if(userdetails.resetPasswordExpires < Date.now()){
         return res.status(403).json({
             success: false,
             message: `Token is Expired, Please Regenerate Your Token`
         })
     }
     // hash password
     const hashedPassword= await bcrypt.hash(password,10);
     //update password
      await User.findOneAndUpdate(
         {token:token},
         {password:hashedPassword},
         {new:true},
      )
     //return response
 
     return res.status(200).json({
         success: true,
         message:`Password Reset Successful`
     });
   }
    catch (error) {
    console.log(error);
    return res.status(500).json({
        success: false,
        message:`Some Error in Updating the Password`,
        error:error.message
    });
   }

}
