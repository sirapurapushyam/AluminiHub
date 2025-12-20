const express = require('express');
const { body } = require('express-validator');
const collegeController = require('../controllers/collegeController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Get college details
router.get('/:collegeCode', 
  authenticateToken, 
  collegeController.getCollege
);

// Update college details
router.put('/:collegeCode', 
  authenticateToken, 
  requireRole('college_admin'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 200 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('website').optional().isURL(),
    body('address.*').optional().trim()
  ],
  validate,
  collegeController.updateCollege
);

// Get college statistics
router.get('/:collegeCode/stats',
  authenticateToken,
  requireRole('college_admin'),
  collegeController.getCollegeStats
);

// Get college activity feed
router.get('/:collegeCode/activity',
  authenticateToken,
  collegeController.getActivityFeed
);

module.exports = router;