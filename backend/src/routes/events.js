const express = require('express');
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const { authenticateToken, requireRole, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { upload } = require('../services/cloudinaryService');

const router = express.Router();

// Create event
router.post('/',
  authenticateToken,
  requireRole('college_admin', 'faculty'),
  requireApproval,
  upload('events').single('eventImage'),
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('description').notEmpty().isLength({ max: 2000 }),
    body('eventDate').isISO8601(),
    body('location').notEmpty().trim(),
    body('eventType').isIn(['reunion', 'seminar', 'workshop', 'cultural', 'sports', 'other']),
    body('maxAttendees').optional().isInt({ min: 1 })
  ],
  validate,
  eventController.createEvent
);

// Get events
router.get('/college/:collegeCode',
  authenticateToken,
  requireApproval,
  eventController.getEvents
);

// Get single event
router.get('/:eventId',
  authenticateToken,
  requireApproval,
  eventController.getEvent
);

// Update event
router.put('/:eventId',
  authenticateToken,
  requireRole('college_admin', 'faculty'),
  upload('events').single('eventImage'),
  eventController.updateEvent
);

// Delete event
router.delete('/:eventId',
  authenticateToken,
  requireRole('college_admin', 'faculty'),
  eventController.deleteEvent
);

// Register for event
router.post('/:eventId/register',
  authenticateToken,
  requireApproval,
  eventController.registerForEvent
);

// Cancel registration
router.post('/:eventId/cancel',
  authenticateToken,
  requireApproval,
  eventController.cancelRegistration
);

// Get event attendees
router.get('/:eventId/attendees',
  authenticateToken,
  requireRole('college_admin', 'faculty'),
  eventController.getAttendees
);

// Mark attendance
router.post('/:eventId/attendance',
  authenticateToken,
  requireRole('college_admin', 'faculty'),
  [
    body('attendees').isArray(),
    body('attendees.*').isMongoId()
  ],
  validate,
  eventController.markAttendance
);

module.exports = router;