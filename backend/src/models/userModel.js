const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  street: { type: String, required: true },
  building: { type: String, required: true },
  apartment: { type: String, required: true },
  zipCode: { type: String, required: false},
  isDefault: { type: Boolean, default: true }
});

const userSchema = new mongoose.Schema({
  // Auth
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },

  // Customer Account
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  shippingAddresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);