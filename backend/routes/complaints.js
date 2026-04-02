const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateComplaintHash } = require('../blockchain');

// Create uploads folder
const uploadDir = '/tmp/uploads/evidence';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, MP4 allowed.'));
    }
  }
});

// Submit a new complaint
router.post('/submit', upload.single('evidence'), async (req, res) => {
  try {
    const { title, description, category, location, pseudo_citizen_id } = req.body;
    const evidencePath = req.file ? `/uploads/evidence/${req.file.filename}` : null;
    const complaintNumber = 'GRV' + Date.now();

    // Save to database
    const result = await pool.query(
      `INSERT INTO complaints 
        (complaint_number, pseudo_citizen_id, title, description, category, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Filed')
       RETURNING *`,
      [complaintNumber, pseudo_citizen_id || 'ANONYMOUS', title, description, category, location]
    );

    const complaint = result.rows[0];

    // Save evidence to evidence table
    if (evidencePath) {
      await pool.query(
        `INSERT INTO evidence (complaint_id, file_path, file_type, ai_authentic)
         VALUES ($1, $2, $3, $4)`,
        [complaint.id, evidencePath, req.file.mimetype, true]
      );
    }

    // Generate blockchain hash
    try {
      const hash = generateComplaintHash(
        complaint.complaint_number,
        complaint.title,
        complaint.created_at
      );
      await pool.query(
        'UPDATE complaints SET blockchain_hash = $1 WHERE id = $2',
        [hash, complaint.id]
      );
      complaint.blockchain_hash = hash;
    } catch (error) {
      console.error('Hashing failed:', error.message);
    }

    res.json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: complaint,
      evidence: evidencePath
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all complaints
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM complaints ORDER BY created_at DESC'
    );
    res.json({ success: true, complaints: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single complaint with evidence
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM complaints WHERE complaint_number = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Get evidence
    const evidence = await pool.query(
      'SELECT * FROM evidence WHERE complaint_id = $1',
      [result.rows[0].id]
    );

    res.json({
      success: true,
      complaint: result.rows[0],
      evidence: evidence.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update complaint status
router.put('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE complaints SET status = $1 WHERE complaint_number = $2 RETURNING *',
      [status, id]
    );
    res.json({ success: true, complaint: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;