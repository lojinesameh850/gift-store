// One-off script to create an admin account directly in the database.
// Never exposed over HTTP - run it from the terminal only, e.g. to bootstrap
// the very first admin (since POST /api/admin/auth/register-admin now
// requires an existing admin's token, there needs to be a way to create
// admin #1).
//
// Usage (from backend/):
//   node src/seeds/createAdmin.js "Jane Doe" jane@example.com "SomeStrongPassword123"

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

async function main() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error('Usage: node src/seeds/createAdmin.js "Full Name" email@example.com password');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters long.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    console.error(`A user with email ${normalizedEmail} already exists (role: ${existing.role}).`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(' ') || 'Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
    role: 'admin'
  });

  console.log(`Admin created: ${admin.email} (id: ${admin._id})`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Failed to create admin:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});