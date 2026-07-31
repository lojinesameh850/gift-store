const express = require('express');
const router = express.Router();
const adminCategoryController = require('../controllers/adminCategoryController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', adminMiddleware, adminCategoryController.getAllCategories);
router.post('/', adminMiddleware, adminCategoryController.createCategory);
router.get('/:id', adminMiddleware, adminCategoryController.getCategoryById);
router.put('/:id', adminMiddleware, adminCategoryController.updateCategory);
router.delete('/:id', adminMiddleware, adminCategoryController.deleteCategory);

module.exports = router;