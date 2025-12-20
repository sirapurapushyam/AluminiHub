// routes/mentorship.js
const express = require('express');
const { body } = require('express-validator');
const mentorshipController = require('../controllers/mentorshipController');
const { authenticateToken, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Get mentor recommendations (IMPORTANT: This must come before /mentors route)
router.get('/mentors/recommendations',
  authenticateToken,
  requireApproval,
  mentorshipController.getMentorRecommendations
);

// Get available mentors
router.get('/mentors',
  authenticateToken,
  requireApproval,
  mentorshipController.getAvailableMentors
);

// Request mentorship
router.post('/request',
  authenticateToken,
  requireApproval,
  [
    body('mentorId').isMongoId().withMessage('Invalid mentor ID'),
    body('area').isIn(['career', 'academics', 'research', 'entrepreneurship', 'personal_development', 'other']).withMessage('Invalid area'),
    body('description').notEmpty().isLength({ min: 50, max: 1000 }).withMessage('Description must be between 50-1000 characters'),
    body('goals').optional().isArray().withMessage('Goals must be an array'),
    body('goals.*').optional().isLength({ max: 200 }).withMessage('Each goal must be less than 200 characters'),
    body('requestMessage').notEmpty().isLength({ max: 500 }).withMessage('Request message is required and must be less than 500 characters')
  ],
  validate,
  mentorshipController.requestMentorship
);

// Get mentorship requests (for mentor)
router.get('/requests',
  authenticateToken,
  requireApproval,
  mentorshipController.getMentorshipRequests
);

// Get my mentorships (as mentee)
router.get('/my-mentorships',
  authenticateToken,
  requireApproval,
  mentorshipController.getMyMentorships
);

// Respond to mentorship request
router.put('/requests/:requestId/respond',
  authenticateToken,
  requireApproval,
  [
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status'),
    body('responseMessage').optional().isLength({ max: 500 }).withMessage('Response message must be less than 500 characters')
  ],
  validate,
  mentorshipController.respondToRequest
);

// Add mentorship session
router.post('/:mentorshipId/sessions',
  authenticateToken,
  requireApproval,
  [
    body('date').isISO8601().withMessage('Invalid date format'),
    body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15-480 minutes'),
    body('mode').isIn(['online', 'offline', 'phone']).withMessage('Invalid mode'),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
  ],
  validate,
  mentorshipController.addSession
);

// Complete mentorship
router.put('/:mentorshipId/complete',
  authenticateToken,
  requireApproval,
  mentorshipController.completeMentorship
);

// Add feedback
router.post('/:mentorshipId/feedback',
  authenticateToken,
  requireApproval,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
  ],
  validate,
  mentorshipController.addFeedback
);

module.exports = router;