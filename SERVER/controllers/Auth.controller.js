const User=require('../models/User.model')
const OTP=require('../models/OTP.model')
const otpGenerator=require('otp-generator')
const bcrypt=require('bcrypt')
const Profile= require('../models/Profile.model')
const mailSender= require("../utils/mailSender")
const {passwordUpdated}=require("../mail/templates/passwordUpdate")
const jwt=require('jsonwebtoken')
require('dotenv').config();

// Send OTP For Email Verification
exports.sendOTP=async(req,res)=>{
    try {
        //fetch email from req body
    const {email}=req.body;

    // Check if user is already present
		// Find user with provided email
    const checkUserPresent=await User.findOne({email});

    //id user exist then return a response
    if(checkUserPresent){
        // Return 401 Unauthorized status code with error message
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

    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);

    while(result){
        otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
        });
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
        otp,
    }=req.body;
    //validate data
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp  ) {
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
            message:"User isAlready Registered please sign in "
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
            message:"OTP Is  Not  found"
        })
    }
    else if(otp !==recentOtp[0].otp){
        //invalid otp
        return res.status(400).json({
            success:false,
            message:"Invalid  OTP",
        });
    }


    //hash password
    const hashedPassword= await bcrypt.hash(password,10);

    //crete the user
    let approved ="";
    approved === "Instructor" ?(approved = false):(approved = true);

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
        accountType:accountType,
        approved:approved,
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
        const {email,password}=req.body;
        //validation of data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:" all fileds are required please try again"
            });
        }
        //find the User with provided Email
        const user= await User.findOne({email}).populate("additionalDetails");

        //If user not found  with email
        if(!user){
            // Return 401 Unauthorized status code with error message
            return res.status(401).json({
                success:false,
                message:"User is not Registered with Us Please SignUp to Continue",
            });
        }
   // Generate JWT token and Compare Password

        if(await bcrypt.compare(password,user.password)) {
            const payload= {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            };
            const token= jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"24h",
            });
            // Save token to user document in database
            user.token=token;
            user.password=undefined;
        

        // Set cookie for token and return success response
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
            message:"password is incorrect",
        })
    }
    } catch (error) {
        // Return 500 Internal Server Error status code with error message
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure Please Try Again",
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

    try {
        	// Get user data from req.user
		const userDetails = await User.findById(req.user.id);                         //	// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;           
	// Validate old password
		const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password );                 // Validate old password
			 
		if(!isPasswordMatch) {                                  // If old password does not match, return a 401 (Unauthorized) error
			return res.status(401).json({ success: false, message: "The password is incorrect" });	 
		}
// Match new password and confirm new password
		if(newPassword !== confirmNewPassword) {        
            // If new password and confirm new password do not match, return a 400 (Bad Request) error                    
            return res.status(401).json({ success: false, message: "The password and confirm password does not match" });	 
		}
			 // Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);             // Update password
		const updatedUserDetails = await User.findByIdAndUpdate(req.user.id , { password: encryptedPassword } , { new: true });
                                                                                  // find user by id and then update password = encryptedPassword , here if you "const updatedUserDetails =" does not wirte this then also it not affect;
		 
		try {                                                          // Send notification email , here passwordUpdated is template of email which is send to user;
			const emailResponse = await mailSender(updatedUserDetails.email, passwordUpdated(updatedUserDetails.email, `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`));


			console.log("Email sent successfully:", emailResponse.response);
		   } 
           
        catch(error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}
        // Return success response
		return res
        .status(200)
        .json({
             success: true, 
             message: "Password updated successfully"
             });         // Return success response 	 
	 } 
    catch(error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
}
