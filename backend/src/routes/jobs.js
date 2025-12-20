// routes/job.routes.js
const express = require('express');
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const { authenticateToken, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Get my posted jobs
router.get('/my-jobs',
  authenticateToken,
  requireApproval,
  jobController.getMyJobs
);

// Get jobs
router.get('/',
  authenticateToken,
  requireApproval,
  jobController.getJobs
);

// Create job posting (only alumni, faculty, college_admin)
router.post('/',
  authenticateToken,
  requireApproval,
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('company').notEmpty().trim(),
    body('package').notEmpty().trim(),
    body('externalLink').notEmpty().isURL(),
    body('description').optional().isLength({ max: 1000 }),
    body('targetAudience').isIn(['my_batch', 'seniors', 'juniors', 'all']),
    body('experienceRequired').optional().isIn(['0-1', '1-3', '3-5', '5+', 'any']),
    body('referralAvailable').optional().isBoolean(),
    body('referralCount').optional().isInt({ min: 0 })
  ],
  validate,
  jobController.createJob
);

// Get single job
router.get('/:jobId',
  authenticateToken,
  requireApproval,
  jobController.getJob
);

// Update job
router.put('/:jobId',
  authenticateToken,
  jobController.updateJob
);

// Delete job
router.delete('/:jobId',
  authenticateToken,
  jobController.deleteJob
);

// Show interest in job
router.post('/:jobId/interest',
  authenticateToken,
  requireApproval,
  [
    body('requestReferral').optional().isBoolean()
  ],
  validate,
  jobController.showInterest
);

// Get interested users
router.get('/:jobId/interested-users',
  authenticateToken,
  jobController.getInterestedUsers
);

// Grant referral
router.post('/:jobId/grant-referral',
  authenticateToken,
  [
    body('userId').notEmpty().isMongoId()
  ],
  validate,
  jobController.grantReferral
);

module.exports = router;