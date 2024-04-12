const Course=require('../models/Course.model')
const Tag=require('../models/Tags.model')
const User= require('../models/User.model')
const {uploadImageToCloudinary}=require('../utils/imageUploader')
require('dotenv').config()


// create course handler
exports.createCourse=async(req,res)=>{
    try {
        //fetch data from req body
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;
        //get thubnail
        const thumbnail= req.files.thumbnailImage;

        //validation

        if(!courseDescription || !courseName || !thumbnail || !price || !tag || !whatYouWillLearn){
            return res.status(400).json({
                success: false,
                message:"All fileds arerequired"
            })
        }

        //check for instructer
        const userId=req.user.id;
        const instructerDetails= await User.findById(userId)
        console.log(instructerDetails);
        //TODO => verify that userId  and  instructerDetails._id are same or different

        if(!instructerDetails){
            return res.status(404).json({
                success: false,
                message:"Instructer details not found"
            })
        }

        //check given tag valid or not
        const tagDetails= await Tag.findById(tag);

        if(!tagDetails){
            return res.status(404).json({
                 success:false,
            message:"Tag Details not found",
            })
        }

        //upload to cloudinary 
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)


        //create an entry for new course

        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructerDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });
        

        //add the new course to the userschema
        await User.findByIdAndUpdate(
            {_id:instructerDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
               
            } ,
            {new:true}
        )

        //update the Tags ka schema
        //todo hw


        //return res
        return res.status(200).json({
            success: true,
            message:"course created successfully",
            data:newCourse
        })

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:error.message,
        })   
    }
}



///get all courses

exports.showAllCourses=async(req,res)=>{
    try {
        //TOdo//change the below statement
        const allCourses= await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        })
        .populate("instructor")
        .exec()

        return res.status(200).json({
            success:true,
            message:"data for allCourses fetched successfully",
            data:allCourses,
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to get all courses",
            error:error.message
        })
    }
}

