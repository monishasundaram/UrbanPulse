const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`UrbanPulse backend running on port ${PORT}`);
});
