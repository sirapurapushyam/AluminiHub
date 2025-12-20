const express = require('express');
const { body } = require('express-validator');
const contentController = require('../controllers/contentController');
const { authenticateToken, requireRole, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Create content
router.post('/', 
  authenticateToken, 
  requireRole('college_admin'), 
  requireApproval,
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('type').isIn(['announcement', 'event', 'news']),
    body('eventDate').if(body('type').equals('event')).isISO8601(),
    body('eventLocation').if(body('type').equals('event')).notEmpty()
  ],
  validate,
  contentController.createContent
);

// Get content for college
router.get('/college/:collegeCode', 
  authenticateToken, 
  requireApproval,
  contentController.getContent
);

// Get single content
router.get('/:contentId',
  authenticateToken,
  requireApproval,
  contentController.getSingleContent
);

// Update content
router.put('/:contentId', 
  authenticateToken, 
  requireRole('college_admin'),
  contentController.updateContent
);

// Delete content
router.delete('/:contentId', 
  authenticateToken, 
  requireRole('college_admin'),
  contentController.deleteContent
);

// Get my content
router.get('/my-content',
  authenticateToken,
  requireRole('college_admin'),
  contentController.getMyContent
);

module.exports = router;