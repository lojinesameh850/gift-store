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
		images: {
			type: [String],
			default: [],
		},
		category: {
			type: String,
			required: [true, "Product category is required"],
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		stock: {
			type: Number,
			default: 0,
			min: [0, "Stock cannot be negative"],
		},
	},
	{
		timestamps: true,
	},
);

productSchema.index({ name: "text", description: "text" });

productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
