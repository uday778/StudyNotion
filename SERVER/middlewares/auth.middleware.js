const jwt= require('jsonwebtoken');
require('dotenv').config();
const User= require('../models/User.model');

//auth
exports.auth=async(req,res)=>{
    try {
        ///extract token 
        const token=req.cookies.token
         || req.body.token 
         || req.header("Authorization").replace("Bearer","");

         // if token missing return response

         if(!token){
            return res.status(401).json({
                success: false,
                message:"Token is missing",
            });
         }

         //verify the token

         try {
            const decode = await jwt.verify(token,process.env.JWT_SECRET)
            console.log(decode);
            req.user=decode
         }
          catch (error) {
            //verification --issue
            return res.status(401).json({
                success: false,
                message:"token is invalid"
            })
         }
         next();


    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"something went wrong while validating the token"
        })
    }
}

//is Student 

exports.isStudent=async(req,res)=>{
    try {
        if(req.user.accountType !=="Student"){
            return res.status(401).json({
                success: false,
                message:"this is a protected route for students only"
            })
        }
    } 
    catch (error) {
        return res.status(500).json({
            success: false,
            message:"User Role is cannotbe verified"
        })
    }
}

// isinstructer

exports.isInstructor=async(req,res)=>{
    try {
        if(req.user.accountType !=="Instructor"){
            return res.status(401).json({
                success: false,
                message:"this is a protected route for Instructor only"
            })
        }
    } 
    catch (error) {
        return res.status(500).json({
            success: false,
            message:"User Role is cannot be verified"
        })
    }
}

//isAdmin
exports.isAdmin=async(req,res)=>{
    try {
        if(req.user.accountType !=="Admin"){
            return res.status(401).json({
                success: false,
                message:"this is a protected route for Admin only"
            })
        }
    } 
    catch (error) {
        return res.status(500).json({
            success: false,
            message:"User Role is cannot be verified"
        })
    }
}

