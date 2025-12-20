const express = require('express');
const { body } = require('express-validator');
const queryController = require('../controllers/queryController');
const { authenticateToken, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication and approval
router.use(authenticateToken, requireApproval);

// Create a new query
router.post('/',
  [
    body('subject').notEmpty().trim().isLength({ max: 200 }),
    body('description').notEmpty().isLength({ max: 5000 }),
    body('category').isIn(['technical', 'account', 'events', 'jobs', 'mentorship', 'general', 'academic', 'administrative'])
  ],
  validate,
  queryController.createQuery
);

// Get my queries (for any user)
router.get('/my-queries', queryController.getMyQueries);

// Get queries (faculty and admin can see queries based on their role)
router.get('/', queryController.getQueries);

// Get a single query
router.get('/:queryId', queryController.getQuery);

// Update a query (faculty and admin)
router.put('/:queryId',
  [
    body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('assignedTo').optional().isMongoId(),
    body('resolution').optional().isLength({ max: 5000 })
  ],
  validate,
  queryController.updateQuery
);

// Add comment to query
router.post('/:queryId/comments',
  [
    body('comment').notEmpty().isLength({ max: 1000 })
  ],
  validate,
  queryController.addComment
);

module.exports = router;