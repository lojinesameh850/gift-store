const mongoose = require("mongoose");
const Product = require("../models/productModel");

const escapeRegex = (string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.getAllProducts = async (req, res) => {
	try {
		const {
			search,
			category,
			tags,
			minPrice,
			maxPrice,
			sort,
			page,
			limit,
		} = req.query;

		let filter = { isActive: true };

		if (search && typeof search === "string" && search.trim() !== "") {
			const safeSearch = escapeRegex(search.trim());
			filter.$or = [
				{ name: { $regex: safeSearch, $options: "i" } },
				{ description: { $regex: safeSearch, $options: "i" } },
			];
		}

		if (category && typeof category === "string") {
			if (mongoose.Types.ObjectId.isValid(category)) {
				filter.category = category;
			} else {
				return res.status(400).json({
					success: false,
					message: "Invalid category ID format",
				});
			}
		}

		if (tags && typeof tags === "string") {
			const tagsArray = tags
				.split(",")
				.filter((tag) => mongoose.Types.ObjectId.isValid(tag.trim()));
			if (tagsArray.length > 0) {
				filter.tags = { $in: tagsArray };
			}
		}

		if (minPrice !== undefined || maxPrice !== undefined) {
			filter.price = {};
			if (minPrice !== undefined && !isNaN(Number(minPrice))) {
				filter.price.$gte = Number(minPrice);
			}
			if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
				filter.price.$lte = Number(maxPrice);
			}
			if (Object.keys(filter.price).length === 0) {
				delete filter.price;
			}
		}

		const sortOptionsMap = {
			"lowest-price": { price: 1 },
			"highest-price": { price: -1 },
			newest: { createdAt: -1 },
			oldest: { createdAt: 1 },
		};
		const sortOption = sortOptionsMap[sort] || { createdAt: -1 };

		let pageNumber = parseInt(page);
		let limitNumber = parseInt(limit);

		pageNumber = pageNumber > 0 && !isNaN(pageNumber) ? pageNumber : 1;

		limitNumber = limitNumber > 0 && !isNaN(limitNumber) ? limitNumber : 12;
		if (limitNumber > 100) limitNumber = 100;

		const skip = (pageNumber - 1) * limitNumber;

		const [products, totalProducts] = await Promise.all([
			Product.find(filter)
				.populate("category", "name slug")
				.populate("tags", "name slug")
				.sort(sortOption)
				.skip(skip)
				.limit(limitNumber),
			Product.countDocuments(filter),
		]);

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
			message: "Server Error",
			error: error.message,
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
			message: "Server Error",
			error: error.message,
		});
	}
};
