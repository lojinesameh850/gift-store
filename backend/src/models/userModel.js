const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  street: { type: String, required: true },
  building: { type: String, required: true },
  apartment: { type: String, required: false },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  // Auth
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  // Holds the JWT issued at the user's last login. Set to null on logout.
  // authMiddleware checks incoming tokens against this field, so a token
  // stops working immediately after logout even though the JWT itself
  // hasn't technically expired yet.
  activeToken: { type: String, default: null },

  // Customer Account
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  shippingAddresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Cart
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 }
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);