const Profile= require("../models/Profile.model");
const User= require("../models/User.model");

exports.updateProfile=async(req,res)=>{
    try {
        ///get data
        const {dateofBirth="",about="",contactNumber,gender}=req.body
        //get userID
        const id=req.user.id;
        //validate
        if(!contactNumber || !gender){
            return res.status(400).json({
                success: false,
                message:"all fields are required"
            })
        }
        //find profile
        const userDetails= await User.findById(id);
        const profileId= userDetails.additionalDetails
        const profileDetails= await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth=dateofBirth,

        profileDetails.about=about,

        profileDetails.gender=gender,

        profileDetails.contactNumber=contactNumber,
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"profile updated successfully",
            profileDetails,
        });

    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"error occure while updating profile",
            error:error.message
        })
    }
}

exports.deleteAccount=async(req,res)=>{
    try {
        //get Id
        const id = req.user.id;
        //validation
        const userDetails= await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"user not found",

            })
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})
        //todo:HW unenrolled user from all enrolled courses
        //delete user
        await User.findByIdAndDelete({_id:id})
        
        //return response 
        return res.status(200).json({
            success:true,
            message:"user account is deleted successfully",
        })   
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"error encountered while deleting account "
        })
    }
}

// explore -> how can we schedule this deletion operation
// cron job -> 


exports.getAllUserDetails=async(req,res)=>{
    try {
        //get ID
        const id=req.user.id
        //validation and get user details
        const userDetails=await User.findById(id).populate("additionalDetails").exec();

        //return response
        return res.status(200).json({
            success:true,
            message:"user data fetched successfully",
        });


    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message        })
    }
}