const Section = require("../models/Section.model");
const Course = require("../models/Course.model")


exports.createSection=async(req,res)=>{
    try {
   // Extract the required properties from the request body
        const {sectionName,courseId}=req.body;

       	// Validate the input
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message: "Missing required properties"
            });
        }
        	// Create a new section with the given name
        const newSection = await Section.create({sectionName});
       // Add the new section to the course's content array
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },
            {new:true},
        )
        .populate("courseContent.Section")
        // .populate({
        //     path: "courseContent",
        //     populate: {
        //         path: "subSection",
        //     },
        // })
        .exec();
       
    // Return the updated course object in the response
        return res.status(200).json({
        success:true,
        message:"Section created successfully",
        updatedCourseDetails,
});

    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to create section , pleasetry again",
            error: error.message,
        });
    }
}

// UPDATE a section
exports.updateSection=async(req,res)=>{
    try {
        //data fetch in input
        const {sectionName,SectionId}=req.body;
        //data validation
        if(!sectionName || !SectionId){
            return res.status(400).json({
                success:false,
                message:"missing  all properties"
            })
        }
        
        
        //update data
        const section= await Section.findByIdAndUpdate(SectionId,{sectionName},{new:true})
        //return response
        // console.error("Error deleting section:", error);
        return res.status(200).json({
            success:true,
            message:section,

        })

    } 
    catch (error) {
        console.error("Error while updating section:", error);
        return res.status(500).json({
            success:false,
            message: "Internal server error, Unable to Update Section"
        })
    }
}


// DELETE a section
exports.deleteSection=async(req,res)=>{
    try {
        //data fetch section Id
        const {SectionId}= req.body;
        //use findbyidanddelete
        const deletedSection= await Section.findByIdAndDelete(SectionId)
        //return response
        return res.status(200).json({
            success:true,
            message :"section deleted successfully",
            data:deletedSection,
        })
    } 
    catch (error) {
        console.error("Error deleting section:", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error,Unable to Delete  Section ",
        })
    }
}