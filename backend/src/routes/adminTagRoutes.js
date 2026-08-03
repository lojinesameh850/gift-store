const express = require('express');
const router = express.Router();

const adminTagController = require('../controllers/adminTagController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', adminMiddleware, adminTagController.getAllTags);
router.post('/', adminMiddleware, adminTagController.createTag);
router.get('/:id', adminMiddleware, adminTagController.getTagById);
router.put('/:id', adminMiddleware, adminTagController.updateTag);
router.delete('/:id', adminMiddleware, adminTagController.deleteTag);

module.exports = router;