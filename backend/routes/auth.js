const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { sendWelcomeEmail } = require('../email');

// Register Citizen
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, aadhaar, email } = req.body;

    // Check if phone already exists
    const existing = await pool.query(
      'SELECT * FROM citizens WHERE phone_encrypted = $1',
      [phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    // Generate pseudonymous ID
    const pseudoId = 'CIT' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to database
    const result = await pool.query(
      `INSERT INTO citizens 
        (pseudo_id, name_encrypted, phone_encrypted, aadhaar_encrypted, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING pseudo_id, created_at`,
      [pseudoId, name, phone, aadhaar, hashedPassword]
    );

    // Send welcome email
    if (email) {
  sendWelcomeEmail(email, { pseudoId }).catch(err => 
    console.error('Email failed silently:', err.message)
  );
}

    res.json({
      success: true,
      message: 'Citizen registered successfully',
      pseudoId: result.rows[0].pseudo_id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM citizens WHERE phone_encrypted = $1',
      [phone]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid phone or password' });
    }

    const citizen = result.rows[0];
    const valid = await bcrypt.compare(password, citizen.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid phone or password' });
    }

    const token = jwt.sign(
      { id: citizen.id, pseudoId: citizen.pseudo_id, role: 'citizen' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      pseudoId: citizen.pseudo_id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/test-email', async (req, res) => {
  const { sendWelcomeEmail } = require('../email');
  const result = await sendWelcomeEmail('your.email@gmail.com', { pseudoId: 'TEST123' });
  res.json({ success: result });
});

module.exports = router;
