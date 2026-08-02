const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');

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

// GET /api/account/wishlist (Fetch logged-in user's wishlist, populated with product details)
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('wishlist')
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/account/wishlist/:productId (Add a product to the wishlist)
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    // Only allow adding products that exist and are currently active/for sale
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const alreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      return res.status(409).json({ success: false, message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/account/wishlist/:productId (Remove a product from the wishlist)
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const originalLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);

    if (user.wishlist.length === originalLength) {
      return res.status(404).json({ success: false, message: 'Product not in wishlist' });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};