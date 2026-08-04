const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const customerMiddleware = require('../middleware/customerMiddleware');

// Get the authenticated user's cart
router.get('/', mockAuthMiddleware, cartController.getCart);

// Add product to cart
router.post('/', customerMiddleware, cartController.addToCart);

// Remove product from cart
router.delete('/:productId', customerMiddleware, cartController.removeFromCart);

// Update product quantity in cart
router.put('/:productId', customerMiddleware, cartController.updateQuantity);

module.exports = router;