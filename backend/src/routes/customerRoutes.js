const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const mockAuthMiddleware = require('../middleware/mockAuth'); // Temp mock middleware

// Protect all routes with auth middleware
router.get('/profile', mockAuthMiddleware, customerController.getProfile);
router.put('/profile', mockAuthMiddleware, customerController.updateProfile);

module.exports = router;