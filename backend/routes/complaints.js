const express = require('express');
const router = express.Router();

// Submit a new complaint
router.post('/submit', async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    // Generate complaint number
    const complaintNumber = 'GRV' + Date.now();

    res.json({
      success: true,
      message: 'Complaint submitted successfully',
      complaintNumber: complaintNumber,
      status: 'Filed'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all complaints (public)
router.get('/all', async (req, res) => {
  try {
    // Placeholder — database fetch will be added later
    res.json({
      success: true,
      complaints: []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      complaint: {
        id: id,
        status: 'Filed',
        message: 'Complaint details will load from database soon'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;