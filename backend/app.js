const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const express = require('express');
const { setServers } = require("dns/promises");
setServers(["8.8.8.8", "8.8.4.4"]);
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');

// 1. Import your customer routes
const customerRoutes = require('./src/routes/customerRoutes'); // Adjust path to match project structure
const customerProductRoutes = require('./src/routes/customerProductRoutes');

// 2. Import cart routes
const cartRoutes = require('./src/routes/cartRoutes');

const adminAuthRoutes = require('./src/routes/adminAuthRoutes');
const adminProductRoutes = require('./src/routes/adminProductRoutes');
const adminCategoryRoutes = require('./src/routes/adminCategoryRoutes');
const adminTagRoutes = require('./src/routes/adminTagRoutes');

// NEW: Import auth routes (register/login/forgot-password/otp/reset-password)
const authRoutes = require('./src/routes/authRoutes');


dotenv.config();

const app = express();

// Enable CORS so your Angular app (port 4200) can talk to Express (port 5000)
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Default status route (from teammate)
app.get('/', (req, res) => {
  res.json({
    message: 'Gift Store Backend is Running!',
    status: 'Success'
  });
});

// NEW: Mount auth endpoints (register, login, forgot-password, verify-otp, reset-password)
app.use('/api/auth', authRoutes);

// 3. Mount your Customer Account API endpoints
app.use('/api/account', customerRoutes);

// Public product listing/details endpoints
app.use('/api/products', customerProductRoutes);

// 4. Mount Cart API endpoints
app.use('/api/cart', cartRoutes);

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/tags', adminTagRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});