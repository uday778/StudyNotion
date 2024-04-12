const Tag=require('../models/Tags.model')

//create tag handler function

exports.createTag=async(req,res)=>{
     try {
        // fetch data req from body
        const {name,description}=req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message:"All fields are required "
            })
        } 
        //create a entry in db
        const tagDetails=await Tag.create({
            name:name,
            description:description,
        })
        console.log(tagDetails);
        return res.status(200).json({
            success: true,
            message:"Tag created  successfully"
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


//getAlltags handler functions

exports.showAlltags=async(req,res)=>{
    try {
        const alltags=await Tag.find({},{name:true,description:true})
        res.statu(200).json({
            success:true,
            message:"all tags returned successfully",
            alltags,
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