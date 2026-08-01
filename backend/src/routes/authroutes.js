const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Protected - used by the frontend to restore session state on refresh
router.get('/me', authMiddleware, authController.getMe);

// Protected - requires a valid token; real logout is deleting the token client-side
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;