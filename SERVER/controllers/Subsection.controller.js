const SubSection = require("../models/SubSection.model");
const Section = require("../models/Section.model");
const {uploadImageToCloudinary} = require("../utils/imageUploader")


// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
    try {
        // Extract necessary information from the request body
        const { sectionId, title, timeDuration, description } = req.body;
        //extract video /files
        const video = req.files.videofile;
        //validation
        if (!sectionId ||
            !title ||
            !timeDuration ||
            !description ||
            !video) {
            return res.status(404).json({
                success: false,
                message: "All Fields are Required"
            })
        }
        //upload video to cloudinary
        const uploadvideo = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create subsection
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadvideo.secure_url,
        });
        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
          ).populate("subSection")


        // Return the updated section in the response
        return res.status(200).json({
            success: true,
            message: "sub section created successfully",
            data: updatedSection,
        })
    }
    catch (error) {
        // Handle any errors that may occur during the process
        console.error("Error creating new sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "interal server error occurred",
            error: error.message
        });
    }
}

exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body
        const subSection = await SubSection.findById(sectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        return res.json({
            success: true,
            message: "Section updated successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}

