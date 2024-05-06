const Course=require('../models/Course.model');
const Category=require('../models/Category.model');
const User= require('../models/User.model');
const {uploadImageToCloudinary}=require('../utils/imageUploader');
const RatingAndReview=require("../models/RatingAndReviews.model")

require('dotenv').config()


// Function to create a new course
exports.createCourse=async(req,res)=>{
    try {
       // Get user ID from request object
       const userId = req.user.id

        // Get all required fields from request body
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
            category,
            status,
            instructions,
        }=req.body;
      // Get thumbnail image from request files
        const thumbnail= req.files.thumbnailImage;

        // Check if any of the required fields are missing

        if(!courseDescription || 
            !courseName || 
            !thumbnail ||
            !price || 
            !tag ||
            !whatYouWillLearn ||
            !category
            ){
            return res.status(400).json({
                success: false,
                message:"All Fields are Mandatory"
            })
        }
        if (!status || status === undefined) {
			status = "Draft";
		}

       // Check if the user is an instructor
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
        const categoryDetails= await Category.findById(category);

        if(!categoryDetails){
            return res.status(404).json({
                 success:false,
            message:"Tag Details not found Category Details Not Found",
            })
        }

        // Upload the Thumbnail to Cloudinary
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)


        // Create a new course with the given details

        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructerDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status: status,
			instructions: instructions,
        });
        

		// Add the new course to the User Schema of the Instructor
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
        //todo hw✍🏻✍🏻
        await Category.findByIdAndUpdate(
            {_id:category},
            {
                $push:{
                    course:newCourse._id,
                }
               
            } ,
            {new:true}
        )


       	// Return the new course and a success message
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

//showAllCourses
exports.showAllCourses=async(req,res)=>{
    try {
       
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
            message: `Can't Fetch Course Data`,
            error:error.message
        })
    }
}


//getCourseDetails
exports.getCourseDetails=async(req,res)=>{
    try {
        //get id
        const {courseId}=req.body;

        //find course details
        const courseDetails=await Course.find({_id:courseId}).populate(
            {
                path:"instructor",
                populate:{
                    path:"additionalDetails"
                },
            }
        )
        .populate("category")
        // .populate("RatingAndreviews")
        .populate("courseContent.subSection")
            // {
            //     path:"courseContent",
            //     populate:{
            //         path:"subSection"
            //     }
            // })
            .exec();

    //validation
    if(!courseDetails){
        return res.status(400).json({
            success:false,
            message:`Could Not Find the course With ${courseId}`
        });
    }
//return response
return res.status(200).json({
    success:true,
    message:"Course Details Fetched Successfully",
    data:courseDetails,
})

    }
     catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


