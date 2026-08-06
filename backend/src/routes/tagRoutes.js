const express = require("express");
const router = express.Router();
const Tag = require("../models/tagModel");

// GET /api/tags
router.get("/", async (req, res) => {
	try {
		const tags = await Tag.find({ isActive: true });
		res.status(200).json({ success: true, data: tags });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
