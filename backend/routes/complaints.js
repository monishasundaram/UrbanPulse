const pool = require('../db');
const express = require('express');
const router = express.Router();
const { hashComplaintOnChain } = require('../blockchain');
const { generateComplaintHash } = require('../blockchain');

// Submit a new complaint
router.post('/submit', async (req, res) => {
  try {
    const { title, description, category, location, pseudo_citizen_id } = req.body;

    // Generate complaint number
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
console.log('Saved complaint:', complaint);

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
  console.log('✅ Complaint hashed:', hash);
} catch (error) {
  console.error('Hashing failed:', error.message);
}

// Hash on blockchain asynchronously
try {
  const crypto = require('crypto');
  const evidenceHash = crypto
    .createHash('sha256')
    .update(complaint.complaint_number + complaint.title + complaint.created_at)
    .digest('hex');

  // Update blockchain hash in database
  await pool.query(
    'UPDATE complaints SET blockchain_hash = $1 WHERE id = $2',
    [evidenceHash, complaint.id]
  );
  complaint.blockchain_hash = evidenceHash;
  console.log('✅ Complaint hashed:', evidenceHash);
} catch (error) {
  console.error('Hashing failed:', error.message);
}

res.json({
  success: true,
  message: 'Complaint submitted successfully',
  complaint: complaint
});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all complaints (public)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM complaints ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      complaints: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single complaint by ID
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
    res.json({
      success: true,
      complaint: result.rows[0]
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
    res.json({
      success: true,
      complaint: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;