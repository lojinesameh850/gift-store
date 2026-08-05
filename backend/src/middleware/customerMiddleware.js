const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verifies the JWT, attaches the real logged-in user to req.user, and requires
// role === 'customer'. Replaces mockAuth.js on cart / customer-account routes.
const customerMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.activeToken !== token) {
      return res.status(401).json({ success: false, message: 'You are logged out. Please log in again.' });
    }

    if (user.role !== 'customer') {
      return res.status(403).json({ success: false, message: 'Access Denied. Customer only.' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = customerMiddleware;