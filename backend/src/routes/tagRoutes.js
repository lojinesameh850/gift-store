const express = require('express');
const router = express.Router();

const adminTagController = require('../controllers/adminTagController');

// Public endpoints for tags (no admin auth required)
router.get('/', adminTagController.getAllTags);
router.get('/:id', adminTagController.getTagById);

module.exports = router;
