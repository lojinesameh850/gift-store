const Product = require("../models/productModel");

exports.getAllProducts = async (req, res) => {
	try {
		let { search, category, tags, minPrice, maxPrice, sort, page, limit } =
			req.query;

		let filter = { isActive: true };

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		if (category) {
			filter.category = category;
		}

		if (tags) {
			const tagsArray = tags.split(",");
			filter.tags = { $in: tagsArray };
		}

		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}

		let sortOption = { createdAt: -1 };
		if (sort) {
			switch (sort) {
				case "lowest-price":
					sortOption = { price: 1 };
					break;
				case "highest-price":
					sortOption = { price: -1 };
					break;
				case "newest":
					sortOption = { createdAt: -1 };
					break;
				case "oldest":
					sortOption = { createdAt: 1 };
					break;
				default:
					sortOption = { createdAt: -1 };
			}
		}

		const pageNumber = parseInt(page) || 1;
		const limitNumber = parseInt(limit) || 12;
		const skip = (pageNumber - 1) * limitNumber;

		const products = await Product.find(filter)
			.populate("category", "name slug")
			.populate("tags", "name slug")
			.sort(sortOption)
			.skip(skip)
			.limit(limitNumber);

		const totalProducts = await Product.countDocuments(filter);

		res.status(200).json({
			success: true,
			count: products.length,
			totalProducts,
			totalPages: Math.ceil(totalProducts / limitNumber),
			currentPage: pageNumber,
			data: products,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getProductBySlug = async (req, res) => {
	try {
		const product = await Product.findOne({
			slug: req.params.slug,
			isActive: true,
		})
			.populate("category", "name slug")
			.populate("tags", "name slug");

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found or unavailable",
			});
		}

		res.status(200).json({
			success: true,
			data: product,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
