const SubSection= require("../models/SubSection.model");
const Section= require("../models/Section.model");
const uploadImageToCloudinary=require("../utils/imageUploader")


// Create a new sub-section for a given section
exports.createSubSection = async(req,res)=>{
    try {
       // Extract necessary information from the request body
        const {sectionId,title,timeDuration,description}=req.body;
        //extract video /files
        const video= req.files.videofile;
        //validation
        if(!sectionId || 
            !title ||
             !timeDuration ||
              !description || 
              !video){
            return res.status(404).json({
                success: false,
                message:"All Fields are Required" 
            })
        }
        //upload video to cloudinary
        const uploadvideo= await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        //create subsection
        const SubSectionDetails= await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadvideo.secure_url,
        });
       // Update the corresponding section with the newly created sub-section
        const updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionId},
            {$push:{
                subsection:SubSectionDetails._id,
            }},
            {new:true}
        ).populate("subSection")
        

        // Return the updated section in the response
        return res.status(200).json({
            success: true,
            message:"sub section created successfully",
            data:updatedSection,
        })
    } 
    catch (error) {
        // Handle any errors that may occur during the process
        console.error("Error creating new sub-section:", error);
        return res.status(500).json({
            success:false,
            message:"interal server error occurred",
            error:error.message
        });
    }
}


//homework =>  update section
//H?W => delete sub section