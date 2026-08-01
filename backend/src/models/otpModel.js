const mongoose = require('mongoose');

// Stores short-lived secrets for the password-reset flow. Same collection is
// used for two stages, distinguished by `purpose`:
//   1. 'reset-password-otp'   - the 6-digit code emailed to the user.
//                                Stored (hashed) in the `otp` field.
//   2. 'reset-password-token' - the one-time token issued after the OTP is
//                                verified, which /reset-password requires.
//                                Stored (hashed) in the `resetToken` field.
//
// We never store the raw OTP digits or the raw reset token, only a hash of
// each - same idea as passwordHash on the User model.
//
// expiresAt + the TTL index below: MongoDB automatically deletes the document
// once it expires (this is the "auto-delete after 10 minutes if unused" rule).
// We also explicitly delete the document ourselves the moment it's used, so
// nothing can ever be reused a second time.
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  purpose: { type: String, enum: ['reset-password-otp', 'reset-password-token'], required: true },

  // Populated only when purpose === 'reset-password-otp' (hashed 6-digit code)
  otp: { type: String, default: null },

  // Populated only when purpose === 'reset-password-token' (hashed reset token)
  resetToken: { type: String, default: null },

  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index: MongoDB will remove the document automatically once expiresAt has passed.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);