const { instance } = require("../config/razorpay");
const Course = require("../models/Course.model");
const User = require("../models/User.model");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");


//capture the payments and initiate the Razorpay order

exports.capturePayment = async (req, res) => {
    //get courseId and userId
    const { course_id } = req.body;
    const userId = req.user.id;
    //validation

    //valid courseId 
    if (!course_id) {
        return res.status(400).json({
            success: false,
            message: "please provide valid course ID",
        })
    }
    //valid courseDetails
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.json({
                success: false,
                message: "Could not find the course"
            });
        }
        //user Already pay for the same course 
        //catch the error here✍🏻✍🏻
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: true,
                message: "Student is already enrolled",
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

    //order creation
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };
    try {
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: PaymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })

    }
    catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Could not initiate order",
        });
    }
    //return response

}




//verify signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "123456";
    const signature = req.headers("x-razorpay-signature");
    const shasum = crypto.createHmac("sha256", webhookSecret)

    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest("hex")

    //matching signature with digest
    if (signature === digest) {
        console.log("payment is Authorized")
        //action after course perchased
        const { courseId, userId } = req.body.payload
            .payment
            .entity
            .notes;

        try {
            //fullfill action

            //find the course and enroll the student in the course
            const enrolledCourse=await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message:"course not found"
                });
               
            } 
            console.log(enrolledCourse);

            //find the student and add the course to thier list (dashboard) enrolled courses me
            const enrolledStudent= await  User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true}
            );
            console.log(enrolledStudent);

            //send confirmation mail 

            const emailResponse= await mailSender(
                enrolledStudent.email,
                "Congratulations from Study Notion",

                "Congratulations , you are enrolled into Study Notion Course",
            )
            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message:"Signature verified And Course Added To Dashboard"
            })


        } 
        catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message:error.message
            })
        }


    }
    else{
        return res.status(400).json({
            success: false,
            message:"Invalid request"
        })
    }


}