const SubSection= require("../models/SubSection.model");
const Section= require("../models/Section.model");
const uploadImageToCloudinary=require("../utils/imageUploader")

exports.createSubSection = async(req,res)=>{
    try {
        //fetch data from body
        const {sectionId,title,timeDuration,description}=req.body
        //extract video /files
        const video= req.files.videofile
        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success: false,
                message:"all fields are required"
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
        })
        //update section with this subsection objecvtiveId
        const updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionId},
            {$push:{
                subsection:SubSectionDetails._id,
            }},
            {new:true}
        )
        //homework : log updated section here, after adding populate query

        // return Response
        return res.status(200).json({
            success: true,
            message:"sub section created successfully",
            updatedSection,
        })
    } 
    catch (error) {
        return res.status(500).json({
            success:false,
            message:"interal server error occurred",
            error:message.error
        })
    }
}


//homework =>  update section
//H?W => delete sub section