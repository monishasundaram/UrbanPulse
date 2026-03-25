const express = require('express');
const router = express.Router();

// Officer logs an action
router.post('/log', async (req, res) => {
  try {
    const { complaintId, actionType, description, officerId } = req.body;

    // Generate action ID
    const actionId = 'ACT' + Date.now();

    // Digital signature placeholder
    const signature = Buffer.from(
      `${officerId}-${complaintId}-${Date.now()}`
    ).toString('base64');

    res.json({
      success: true,
      message: 'Action logged successfully',
      actionId: actionId,
      signature: signature,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all actions for a complaint
router.get('/:complaintId', async (req, res) => {
  try {
    const { complaintId } = req.params;
    res.json({
      success: true,
      actions: [],
      message: 'Actions will load from database soon'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;