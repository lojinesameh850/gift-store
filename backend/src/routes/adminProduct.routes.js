const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/adminProduct.controller');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', adminMiddleware, adminProductController.getAllProducts);
router.post('/', adminMiddleware, adminProductController.createProduct);
router.get('/:id', adminMiddleware, adminProductController.getProductById);
router.put('/:id', adminMiddleware, adminProductController.updateProduct);
router.delete('/:id', adminMiddleware, adminProductController.deleteProduct);

module.exports = router;