const User= require('../models/User.model');
const mailSender= require('../utils/mailSender')
const bcrypt= require('bcrypt')


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
            message:"your email is not registered with us"
        });
    }
    //generate token
    const token= crypto.randomUUID()
    // update user by adding token and expiration time
    const updatedDetailes= await User.findOneAndUpdate (
        {email:email},
        {
            token:token,
            resetPasswordExpires:Date.now()+5*60*1000,
        },
        {new: true}

    )
    //create url 
     const url=`http//localhost:3000/update-password/${token}`
    // send mail containing urll
    await mailSender(
        email,
        "password Reset Link",
        `password Reset Link : ${url}`
    )
    // return Response
    return res.status(200).json({
        success: true,
        message:"email send successfully , please check email and change password "
    });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Somethin went wrong while sending reset password mail "
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
             message:"password  does not matching"
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
             message:"Token is expired, please regenerate your token "
         })
     }
     // hash password
     const hashedPassword= await bcrypt.hash(password,10);
     //update password
      await User.findOneAndUpdat(
         {token:token},
         {password:hashedPassword},
         {new:true},
      )
     //return response
 
     return res.status(200).json({
         success: true,
         message:"password reset successfull"
     });
   }
    catch (error) {
    console.log(error);
    return res.status(500).json({
        success: false,
        message:"somethging went while rsesetting password"
    });
   }

}
