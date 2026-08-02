const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const mockAuthMiddleware = require('../middleware/mockAuth'); // Temp mock middleware

// Protect all routes with auth middleware
router.get('/profile', mockAuthMiddleware, customerController.getProfile);
router.put('/profile', mockAuthMiddleware, customerController.updateProfile);

// Wishlist
router.get('/wishlist', mockAuthMiddleware, customerController.getWishlist);
router.post('/wishlist/:productId', mockAuthMiddleware, customerController.addToWishlist);
router.delete('/wishlist/:productId', mockAuthMiddleware, customerController.removeFromWishlist);

module.exports = router;