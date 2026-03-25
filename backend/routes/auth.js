const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Citizen
router.post('/register', async (req, res) => {
  try {
    const { name, phone, aadhaar, password } = req.body;

    // Generate pseudonymous ID
    const pseudoId = 'CIT' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    res.json({
      success: true,
      message: 'Citizen registered successfully',
      pseudoId: pseudoId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Placeholder — database check will be added later
    const token = jwt.sign(
      { phone, role: 'citizen' },
      'urbanpulse_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;