const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const customerMiddleware = require('../middleware/customerMiddleware');

// Protect all routes with real customer authentication
router.get('/profile', customerMiddleware, customerController.getProfile);
router.put('/profile', customerMiddleware, customerController.updateProfile);

// Wishlist
router.get('/wishlist', customerMiddleware, customerController.getWishlist);
router.post('/wishlist/:productId', customerMiddleware, customerController.addToWishlist);
router.delete('/wishlist/:productId', customerMiddleware, customerController.removeFromWishlist);

module.exports = router;