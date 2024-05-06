const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    // Define the email field with type String, required, and trimmed
    email: {
        type: String,
        required: true,
        trim: true
    },
    // Define the password field with type String and required
    password: {
        type: String,
        required: true,
    },
    // Define the role field with type String and enum values of "Admin", "Student", or "Visitor"
    accountType: {
        type: String,
        required: true,
        enum: ["Admin", "Student", "Instructor"],
       
    },
    active:{
        type: Boolean,
        default: true,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile"
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",

        }
    ],
    image: {
        type: String,
        required: true,
    },
    token:{
        type: String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress",

        }
    ],
    
    
},
{timestamps:true}
);

// Export the Mongoose model for the user schema, using the name "user"
module.exports=mongoose.model("User",userSchema)