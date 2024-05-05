const RatingAndReview=require("../models/RatingAndReviews.model");
const Course=require("../models/Course.model");
const  mongoose  = require("mongoose");

//createRating
exports.createRating=async(req,res)=>{
    try {
//get user id
const userId=req.user.id;
//fetchdata from req body
const {rating,review,courseId}=req.body;
//check if user is enrolled or not
const courseDetails=await Course.findOne( 
    {
        _id:courseId,
        studentsEnrolled:{$elemMatch:{$eq:userId}},
    });
    if(!courseDetails){
        return res.status(404).json({
            success:false,
            message:"Students is not enrolled in the Course"
        });
    }
//check if user is already reviewed course
const alreadyReviewed=await RatingAndReview.findOne({
    user:userId,
    course:courseId,
});

if(alreadyReviewed){
    return res.status(403).json({
        success:false,
        message:"Course is already reviewed by the user",
    });
}
//create rating
const ratingReview=await RatingAndReview.create({
    rating,review,
    course:courseId,
    user:userId,
});
//update course with this rating and reviews
const updatedCourseDetails=await Course.findByIdAndUpdate(
    courseId,
    {
        $push:{
            ratingAndReviews:ratingReview._id,
        }
    },
    {new:true}
);
console.log(updatedCourseDetails);
//return response
return res.status(200).json({
    success:true,
    message:"Rating and Review created Successfully",
    ratingReview,
});

1
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}


//getAverageRating
exports.getAverageRating=async(req,res)=>{
    try {
        //get course Id
        const courseId=req.body.courseId
        //calculate avg rating

        const result=await RatingAndReview.aggregate(
            {
                $match:{
                    course :new mongoose.Types.ObjectId.createFromHexString(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ) 
        //return rating
        if(result.length>0){
            return res.status(200).json({
                sucess:true,
                averageRating:result[0].averageRating,
            })
        }
        //if no rating exist
        return res.status(200).json({
            sucess:true,
            message:`Average Rating is 0 , no rating given till now`,
            averageRating:0,
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


//getAllRating

exports.getAllRating=async(req,res)=>{
    try {
        const allReviews = await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName lastName email image"
        })
        .populate({
            path:"course",
            select:"courseName"
        })
        .exec()
        return res.status(200).json({
            success:true,
            message :"ALl Reviews Fetched Successfully",
            data:allReviews,
        })
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}