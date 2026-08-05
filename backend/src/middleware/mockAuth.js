const User = require('../models/userModel');

// Temporary middleware to mock a logged-in user
module.exports = async (req, res, next) => {
  try {
    let userId = req.headers['x-mock-user-id'] || process.env.MOCK_USER_ID;

    if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
      const fallbackUser = await User.findOne({ role: 'customer' }).select('_id').lean();
      if (!fallbackUser) {
        return res.status(500).json({ success: false, message: 'Mock auth failed: no customer user found in DB.' });
      }
      userId = fallbackUser._id.toString();
    } else {
      const existingUser = await User.findById(userId).select('_id').lean();
      if (!existingUser) {
        const fallbackUser = await User.findOne({ role: 'customer' }).select('_id').lean();
        if (!fallbackUser) {
          return res.status(500).json({ success: false, message: 'Mock auth failed: no customer user found in DB.' });
        }
        userId = fallbackUser._id.toString();
      }
    }

    req.user = {
      id: userId,
      role: 'customer'
    };

    next();
  } catch (error) {
    next(error);
  }
};
