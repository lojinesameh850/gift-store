const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verifies the JWT, attaches the real logged-in user to req.user, and requires
// role === 'admin'. Same activeToken check as authMiddleware, so an admin's
// token stops working immediately after logout too - not just customers.
const adminMiddleware = async (req, res, next) => {
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

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access Denied. Admin only.' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = adminMiddleware;