// routes/recommendation.js
const express = require('express');
const axios = require('axios');
const { authenticateToken, requireApproval } = require('../middleware/auth');

const router = express.Router();

router.get('/:studentId', authenticateToken, requireApproval, async (req, res) => {
  try {
    // Ensure the student can only get their own recommendations or admin can get any
    if (req.user._id.toString() !== req.params.studentId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. You can only access your own recommendations.' 
      });
    }

    const pythonURL = `http://localhost:8001/recommend?studentId=${req.params.studentId}`;
    const { data } = await axios.get(pythonURL, {
      timeout: 10000 // 10 second timeout
    });
    
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    console.error('Recommendation service error:', err.message);
    
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      res.status(503).json({ 
        success: false,
        error: 'Recommendation service is currently unavailable',
        details: 'Please try again later or contact support if the problem persists'
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Recommendation service error', 
        details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  }
});

// Alternative endpoint for current user recommendations
router.get('/me/recommendations', authenticateToken, requireApproval, async (req, res) => {
  try {
    console.log("Recommendation")
    const pythonURL = `http://localhost:8001/recommend?studentId=${req.user._id}`;
    const { data } = await axios.get(pythonURL, {
      timeout: 10000
    });
    
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    console.error('Recommendation service error:', err.message);
    res.status(500).json({ 
      success: false,
      error: 'Recommendation service error', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;