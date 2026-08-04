const mongoose = require("mongoose");

require("./categoryModel");
require("./tagModel");

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
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Product category is required"],
		},
		tags: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Tag",
			},
		],
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
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
			select: false,
		},
		deletedAt: {
			type: Date,
			select: false,
		},
	},
	{
		timestamps: true,
	},
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ tags: 1 });

productSchema.index(
	{ slug: 1 },
	{ unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

productSchema.pre(/^find/, function () {
	this.where({ isDeleted: { $ne: true } });
});

module.exports = mongoose.model("Product", productSchema);
