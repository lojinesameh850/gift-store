const express = require('express');
const { setServers } = require("dns/promises");
setServers(["8.8.8.8", "8.8.4.4"]);
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');

// 1. Import your customer routes
const customerRoutes = require('./src/routes/customerRoutes'); // Adjust path to match project structure

// 2. Import cart routes
const cartRoutes = require('./src/routes/cartRoutes');

dotenv.config();

const app = express();

// Enable CORS so your Angular app (port 4200) can talk to Express (port 5000)
app.use(cors());
app.use(express.json());

connectDB();

// Default status route (from teammate)
app.get('/', (req, res) => {
  res.json({
    message: 'Gift Store Backend is Running!',
    status: 'Success'
  });
});

// 3. Mount your Customer Account API endpoints
app.use('/api/account', customerRoutes);

// 4. Mount Cart API endpoints
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});