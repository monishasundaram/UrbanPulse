const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('/tmp/uploads'));

// Database connection
require('./db');

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'UrbanPulse API is running!',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/actions', require('./routes/actions'));

// Keep alive ping for Render free tier
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await pool.query('SELECT 1');
      console.log('Keep alive ping');
    } catch (err) {
      console.error('Keep alive failed:', err.message);
    }
  }, 14 * 60 * 1000); // Every 14 minutes
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`UrbanPulse backend running on port ${PORT}`);
});