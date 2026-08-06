const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // If Atlas can't be reached (bad network, IP not whitelisted, DNS
      // issue), fail within 10s instead of hanging - and any query that
      // ends up waiting on a connected socket also gives up within 20s
      // instead of buffering forever.
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000
    });
    console.log('MongoDB Connected Successfully ✓');
  } catch (error) {
    console.error('✕ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;