const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");

// GET /api/categories
router.get("/", async (req, res) => {
	try {
		const categories = await Category.find({ isActive: true });
		res.status(200).json({ success: true, data: categories });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;