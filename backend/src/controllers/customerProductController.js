const Product = require("../models/productModel");

const getProducts = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page) || 1, 1);
		const limit = Math.min(
			Math.max(parseInt(req.query.limit) || 12, 1),
			50,
		);

		const filter = { isActive: true };

		if (req.query.category) {
			filter.category = req.query.category;
		}

		if (req.query.occasion) {
			filter.occasion = { $in: req.query.occasion.split(",") };
		}

		if (
			req.query.minPrice !== undefined ||
			req.query.maxPrice !== undefined
		) {
			filter.price = {};
			if (req.query.minPrice !== undefined) {
				filter.price.$gte = Number(req.query.minPrice);
			}
			if (req.query.maxPrice !== undefined) {
				filter.price.$lte = Number(req.query.maxPrice);
			}
		}

		if (req.query.search) {
			filter.$text = { $search: req.query.search };
		}

		const sortMap = {
			popular: { sold: -1 },
			price_asc: { price: 1 },
			price_desc: { price: -1 },
			newest: { createdAt: -1 },
			oldest: { createdAt: 1 },
		};

		const sortKey = req.query.sort || "popular";
		if (!sortMap[sortKey]) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid sort parameter" });
		}

		const skip = (page - 1) * limit;

		const [products, totalCount] = await Promise.all([
			Product.find(filter).sort(sortMap[sortKey]).skip(skip).limit(limit),
			Product.countDocuments(filter),
		]);

		res.status(200).json({
			success: true,
			data: {
				products,
				pagination: {
					currentPage: page,
					limit,
					totalPages: Math.ceil(totalCount / limit),
					totalCount,
				},
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong",
		});
	}
};

const getProductBySlug = async (req, res) => {
	try {
		const { slug } = req.params;

		const product = await Product.findOne({ slug: slug, isActive: true });

		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		res.status(200).json({
			success: true,
			data: {
				product,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Something went wrong",
		});
	}
};

module.exports = {
	getProducts,
	getProductBySlug,
};
