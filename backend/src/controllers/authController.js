const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const sendEmail = require('../utils/sendemail');
const { welcomeEmail, otpEmail, passwordChangedEmail } = require('../utils/emailtemplates');

const OTP_TTL_MINUTES = 10;
const RESET_TOKEN_TTL_MINUTES = 10;

const signAuthToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const toSafeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.activeToken;
  return obj;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

// Reset tokens are high-entropy random strings (not user-guessable like a 6-digit
// OTP), so a fast deterministic hash (SHA-256) is fine here and lets us look the
// document up directly by hash - unlike bcrypt, which can't be queried directly
// since it's salted differently every time.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email.trim());

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, shippingAddresses } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'email, password, firstName and lastName are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Duplicate-email check: normalized (trimmed + lowercased) so "Test@x.com",
    // " test@x.com" and "test@x.com" are all treated as the same account and
    // can't be used to register twice.
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // role is intentionally NOT taken from req.body - it always defaults to
    // 'customer' via the schema, so a client can never register itself as admin.
    //
    // shippingAddresses is OPTIONAL. If the client doesn't send it, it defaults
    // to an empty array - same as wishlist and cart, which the schema already
    // defaults to [] on its own.
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      phone,
      shippingAddresses: Array.isArray(shippingAddresses) ? shippingAddresses : []
    });

    // Best-effort welcome email - fire-and-forget so the response doesn't
    // wait on the Gmail SMTP round-trip (can take 1-5+ seconds). Registration
    // still succeeds even if the email fails or is still in flight. The
    // whole thing is wrapped in try/catch so a bug in the template itself
    // (e.g. a bad export) can't crash this request the way it used to -
    // it should only ever cost you the confirmation email, never the
    // action that already succeeded.
    try {
      sendEmail({
        to: user.email,
        subject: 'Your Gift Store account was created successfully',
        html: welcomeEmail(user.firstName)
      }).catch((emailError) => console.error('Failed to send welcome email:', emailError));
    } catch (emailError) {
      console.error('Failed to queue welcome email:', emailError);
    }

    // Registering returns a token so the client can log the user straight in
    // if you want, but it does NOT become the "active session" token - only
    // an actual /login call sets user.activeToken. If you want the frontend
    // to auto-login right after registering, call /login next with the same
    // credentials, or say the word and I'll change this back.
    const token = signAuthToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { token, role: user.role, user: toSafeUser(user) }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Issue a new token and record it as this user's active session.
    // Any previously-issued token (e.g. from an earlier login on another
    // device) stops working the moment this runs, since authMiddleware only
    // accepts the token that matches what's stored here.
    const token = signAuthToken(user);
    user.activeToken = token;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { token, role: user.role, user: toSafeUser(user) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me  (used by the frontend on refresh to know who's logged in)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: { role: user.role, user: toSafeUser(user) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
// Clears the user's activeToken in the database. From this point on, even
// though the JWT itself is technically still cryptographically valid until
// it naturally expires, authMiddleware will reject it - because it no longer
// matches user.activeToken (which is now null). Any request made with the
// old token after this will get "You are logged out, please log in again."
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { activeToken: null });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/forgot-password  { email }
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Explicit check: this email must exist in the users table.
    // Note: in a production app this is normally NOT exposed to the client
    // (a generic "if this email exists..." message is used instead, to stop
    // attackers from using this endpoint to discover which emails are
    // registered). Returning an explicit error here for easier testing.
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // Only one active OTP per email at a time. If one was already issued and
    // hasn't expired yet, don't generate/send a new one - tell the user to wait.
    const existingOtp = await Otp.findOne({ email: normalizedEmail, purpose: 'reset-password-otp' });
    if (existingOtp && existingOtp.expiresAt > new Date()) {
      const minutesLeft = Math.ceil((existingOtp.expiresAt - new Date()) / 60000);
      return res.status(429).json({
        success: false,
        message: `A code was already sent to your email. Please wait ${minutesLeft} minute(s) before requesting a new one.`
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Clear out any previous OTP / reset-token records for this email before creating a new one.
    await Otp.deleteMany({ email: normalizedEmail, purpose: { $in: ['reset-password-otp', 'reset-password-token'] } });

    await Otp.create({
      email: normalizedEmail,
      otp: otpHash,
      purpose: 'reset-password-otp',
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
    });

    // DEV ONLY: print the real OTP to the server console so you can test the
    // reset-password flow without needing email sending to be configured.
    // This never happens in production (NODE_ENV=production).
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] OTP for ${normalizedEmail}: ${otp}`);
    }

    // Email sending is fire-and-forget: don't make the client wait on the
    // Gmail SMTP round-trip. If it fails (e.g. bad SMTP creds), we still want
    // the OTP to exist and be usable via the console log above. Wrapped in
    // try/catch so a template bug can't crash this request either.
    try {
      sendEmail({
        to: normalizedEmail,
        subject: 'Your Gift Store password reset code',
        html: otpEmail(otp)
      }).catch((emailError) => console.error('Failed to send OTP email:', emailError));
    } catch (emailError) {
      console.error('Failed to queue OTP email:', emailError);
    }

    res.status(200).json({ success: true, message: 'A reset code has been sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/verify-otp  { email, otp }
// On success: deletes the OTP record (so it can't be reused), then creates a
// NEW record in the otps collection holding the reset token - this is the
// "reset token generated and stored in the otps table" step. That record has
// its own 10-minute expiresAt/TTL, and gets deleted the moment /reset-password
// actually uses it (or auto-deleted by MongoDB after 10 minutes if unused).
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'email and otp are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpDoc = await Otp.findOne({ email: normalizedEmail, purpose: 'reset-password-otp' });
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otp);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    // OTP is correct and single-use: delete it immediately so it can never be used again.
    await Otp.deleteOne({ _id: otpDoc._id });

    // Generate the reset token and store its hash in the otps collection,
    // in the dedicated `resetToken` field, with its own 10-minute expiry.
    const resetToken = crypto.randomBytes(32).toString('hex');
    await Otp.create({
      email: normalizedEmail,
      resetToken: hashToken(resetToken),
      purpose: 'reset-password-token',
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)
    });

    res.status(200).json({ success: true, message: 'Code verified', data: { resetToken } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/reset-password  { resetToken, newPassword }
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'resetToken and newPassword are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Look the token up directly in the otps collection (by its resetToken
    // field) - this is the DB-backed check, instead of just trusting a signed JWT.
    const tokenDoc = await Otp.findOne({ resetToken: hashToken(resetToken), purpose: 'reset-password-token' });
    if (!tokenDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset session, please request a new code' });
    }

    if (tokenDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ success: false, message: 'Invalid or expired reset session, please request a new code' });
    }

    const user = await User.findOne({ email: tokenDoc.email });
    if (!user) {
      await Otp.deleteOne({ _id: tokenDoc._id });
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    // Changing the password logs the user out everywhere - any token issued
    // before this point stops working.
    user.activeToken = null;
    await user.save();

    // The reset token is single-use: delete it now that it's been used.
    await Otp.deleteOne({ _id: tokenDoc._id });

    // Best-effort confirmation email - fire-and-forget, same reasoning as
    // above, and wrapped in try/catch: this exact call is what crashed the
    // whole request before (missing template export throwing synchronously
    // while building the arguments) - now it can only ever fail silently.
    try {
      sendEmail({
        to: user.email,
        subject: 'Your Gift Store password was changed',
        html: passwordChangedEmail()
      }).catch((emailError) => console.error('Failed to send password-changed email:', emailError));
    } catch (emailError) {
      console.error('Failed to queue password-changed email:', emailError);
    }

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};