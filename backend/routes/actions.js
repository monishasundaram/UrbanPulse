const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads folder if not exists
const uploadDir = 'uploads/actions';
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
const upload = multer({ storage });

// Officer logs an action with optional photo
router.post('/log', upload.single('photo'), async (req, res) => {
  try {
    const { complaint_id, officer_id, action_type, description, status } = req.body;
    const photoPath = req.file ? `/uploads/actions/${req.file.filename}` : null;

    const signature = Buffer.from(
      `${officer_id}-${complaint_id}-${Date.now()}`
    ).toString('base64');

    const result = await pool.query(
      `INSERT INTO actions 
        (complaint_id, officer_id, action_type, description, digital_signature)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [complaint_id, officer_id, action_type || 'Update',
       description + (photoPath ? `||PHOTO:${photoPath}` : ''), signature]
    );

    if (status) {
      await pool.query(
        'UPDATE complaints SET status = $1 WHERE id = $2',
        [status, complaint_id]
      );
    }

    res.json({
      success: true,
      message: 'Action logged successfully',
      action: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all actions for a complaint
router.get('/:complaintId', async (req, res) => {
  try {
    const { complaintId } = req.params;
    const result = await pool.query(
      'SELECT * FROM actions WHERE complaint_id = $1 ORDER BY created_at DESC',
      [complaintId]
    );
    res.json({
      success: true,
      actions: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;