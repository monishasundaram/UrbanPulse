const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Register Citizen
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, aadhaar, email } = req.body;

    const existing = await pool.query(
      'SELECT * FROM citizens WHERE phone_encrypted = $1',
      [phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const pseudoId = 'CIT' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO citizens 
        (pseudo_id, name_encrypted, phone_encrypted, aadhaar_encrypted, password_hash, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING pseudo_id, created_at`,
      [pseudoId, name, phone, aadhaar, hashedPassword, email]
    );

    res.json({
      success: true,
      message: 'Citizen registered successfully',
      pseudoId: result.rows[0].pseudo_id
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Citizen Login
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
      token,
      pseudoId: citizen.pseudo_id
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Officer Login
router.post('/officer-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM officers WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const officer = result.rows[0];

    if (!officer.is_approved) {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval' });
    }

    const valid = await bcrypt.compare(password, officer.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: officer.id, officerId: officer.officer_id, role: 'officer' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Officer login successful',
      token,
      officerId: officer.officer_id,
      name: officer.name
    });
  } catch (error) {
    console.error('Officer login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin — Create Officer (protected, only admin can call this)
router.post('/create-officer', async (req, res) => {
  try {
    const { name, username, password, adminSecret } = req.body;

    // Simple admin secret check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const existing = await pool.query(
      'SELECT * FROM officers WHERE username = $1', [username]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const officerId = 'OFF' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO officers (officer_id, name, username, password_hash, is_approved)
       VALUES ($1, $2, $3, $4, true)`,
      [officerId, name, username, hashedPassword]
    );

    res.json({ success: true, message: 'Officer created!', officerId });
  } catch (error) {
    console.error('Create officer error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin — Get all officers
router.get('/officers', async (req, res) => {
  try {
    const { adminSecret } = req.query;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT id, officer_id, name, username, is_approved, created_at FROM officers ORDER BY created_at DESC'
    );
    res.json({ success: true, officers: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin — Approve/Revoke officer
router.post('/officers/approve', async (req, res) => {
  try {
    const { officerId, approve, adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await pool.query(
      'UPDATE officers SET is_approved = $1 WHERE officer_id = $2',
      [approve, officerId]
    );
    res.json({ success: true, message: approve ? 'Officer approved!' : 'Officer revoked!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TEMP — Setup officers table
router.get('/setup-officers', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS officers (
        id SERIAL PRIMARY KEY,
        officer_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    res.json({ success: true, message: 'Officers table created!' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

module.exports = router;