const Category = require("../models/Category.model");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

///categorypageDetails

exports.categoryPageDetails=async(req,res)=>{
	try {
		//get category Id
		const {categoryId}= req.body
		//get courses for specified category Id
		const selectedCategory= await Category.findById(categoryId)
		.populate("courses")
		.exec()
		//validation
		if(!selectedCategory){
			return res.status(404).json({
				success:false,
				message:"Data Not Found",
			})
		}
		//get  courses for different categories
		const differentCategories=await Category.find({
			_id:{$ne:categoryId},
		})
		.populate("courses")
		.exec();

		//get Top Selling courses

		//h/w-->write it on your own✍🏻✍🏻
		try {
			// Retrieve the top 10 selling courses based on number of students enrolled
			const topSellingCourses = await Course.find({ status: 'Published' })
				.sort({ studentsEnrolled: -1 }) // Sort in descending order of students enrolled
				.limit(10)
				.populate('instructor', 'name') // Populate instructor details
				.populate('category', 'name'); // Populate category details
	
			res.json(topSellingCourses);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ 
				success:false,
				message: 'error file getting Top Selling courses' 
			});
		}

		//return response

		return res.status(200).json({
			success: true,
			data:{
				selectedCategory,
				differentCategories,
			}
		});


		
	} 
	catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: error.message,
		})
	}
}


