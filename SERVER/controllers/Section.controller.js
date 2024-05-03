const Section = require("../models/Section.model");
const Course = require("../models/Course.model")

exports.createSection=async(req,res)=>{
    try {
        //data fetch
        const {sectionName,courseId}=req.body;

        //data validation
        if(!sectionName || courseId){
            return res.status(400).json({
                success:false,
                message:"missing  alll properties"
            })
        }
        ///createsection
        const newSection = await Section.create({sectionName});
        //update course with section objectid
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },
            {new:true},
        );
        // todo : H?W => use populate to replace sections/sun-sections both in the updatedcoursedetails
        //return response
        return res.status(200).json({
        success:true,
        message:"section created successfully",
        updatedCourseDetails,
})

    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to create section , pleasetry again"
        })
    }
}


exports.updateSection=async(req,res)=>{
    try {
        //data fetch in input
        const {sectionName,SectionId}=req.body;
        //data validation
        if(!sectionName || SectionId){
            return res.status(400).json({
                success:false,
                message:"missing  alll properties"
            })
        }
        //update data
        const section= await Section.findByIdAndUpdate(SectionId,{sectionName},{new:true})
        //return response
        return res.status(200).json({
            success:true,
            message:"sectionupdated successfully",

        })

    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to Update  section , pleasetry again"
        })
    }
}



exports.deleteSection=async(req,res)=>{
    try {
        //data fetch section Id
        const {SectionId}= req.params
        //use findbyidanddelete
        const deletedSection= await Section.findByIdAndDelete(SectionId,)
        //return response
        return res.status(200).json({
            success:true,
            message :"section deleted successfully"
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to delete  section , pleasetry again"
        })
    }
}