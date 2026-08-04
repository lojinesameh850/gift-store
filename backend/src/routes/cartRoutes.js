const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const mockAuthMiddleware = require('../middleware/mockAuth');

// Get the authenticated user's cart
router.get('/', mockAuthMiddleware, cartController.getCart);

// Add product to cart
router.post('/', mockAuthMiddleware, cartController.addToCart);

// Remove product from cart
router.delete('/:productId', mockAuthMiddleware, cartController.removeFromCart);

// Update product quantity in cart
router.put('/:productId', mockAuthMiddleware, cartController.updateQuantity);

module.exports = router;
