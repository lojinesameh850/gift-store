const express = require('express');
const {setServers} = require("dns/promises")
setServers(["8.8.8.8","8.8.4.4"])
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.json({
    message: 'Gift Store Backend is Running!',
    status: 'Success'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});