const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
			trim: true,
		},
		slug: {
			type: String,
			required: [true, "Product slug is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Product description is required"],
			trim: true,
		},
		price: {
			type: Number,
			required: [true, "Product price is required"],
			min: [0, "Price cannot be negative"],
		},
		discount: {
			type: Number,
			default: 0,
			min: [0, "Discount cannot be negative"],
		},
		category: {
			type: String,
			required: true,
			enum: [
				"Home & Living",
				"Jewelry",
				"Personalized",
				"Stationery",
				"Sweets & Hampers",
				"Kids",
				"Corporate",
			],
		},
		occasion: {
			type: [String],
			required: true,
			enum: ["Birthday", "Anniversary", "Wedding", "Graduation"],
		},
		images: {
			type: [String],
			required: true,
			default: [],
		},
		stock: {
			type: Number,
			required: true,
			min: [0, "Stock cannot be negative"],
			default: 0,
		},
		sold: {
			type: Number,
			default: 0,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
