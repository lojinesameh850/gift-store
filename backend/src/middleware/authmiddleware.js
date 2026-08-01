const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verifies the JWT and attaches the real logged-in user to req.user.
// This is the "real" replacement for the old mockAuth middleware:
// same shape (req.user.id / req.user.role) so nothing downstream needs to change.
const authMiddleware = async (req, res, next) => {
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

    // This is the actual "are you logged out" check: the JWT signature can be
    // perfectly valid and unexpired, but if it doesn't match what's stored on
    // the user (cleared to null at logout, or replaced by a newer login), it's
    // treated as a stale/logged-out token.
    if (user.activeToken !== token) {
      return res.status(401).json({ success: false, message: 'You are logged out. Please log in again.' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;