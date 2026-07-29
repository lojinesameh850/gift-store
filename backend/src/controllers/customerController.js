const User = require('../models/userModel');

// GET /api/account/profile (Fetch logged-in user profile)
exports.getProfile = async (req, res) => {
  try {
    // req.user.id will come from the auth middleware
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/account/profile (Update profile & addresses)
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, shippingAddresses } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (shippingAddresses) user.shippingAddresses = shippingAddresses;

    await user.save();

    // Return updated user without password hash
    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update profile', error: error.message });
  }
};