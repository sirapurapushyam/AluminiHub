const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// All routes require super admin role
router.use(authenticateToken, requireRole('super_admin'));

// Get pending college registrations
router.get('/colleges/pending', adminController.getPendingColleges);

// Approve/reject college
router.put('/colleges/:collegeId/approval',
  [
    body('status').isIn(['approved', 'rejected']),
    body('rejectionReason').if(body('status').equals('rejected')).notEmpty()
  ],
  validate,
  adminController.approveCollege
);

// Get all colleges
router.get('/colleges', adminController.getAllColleges);

// Get platform statistics
router.get('/stats', adminController.getPlatformStats);

// Manage super admins
router.post('/super-admins',
  [
    body('action').isIn(['list', 'create', 'remove']),
    body('firstName').if(body('action').equals('create')).notEmpty().trim(),
    body('lastName').if(body('action').equals('create')).notEmpty().trim(),
    body('email').if(body('action').equals('create')).isEmail().normalizeEmail(),
    body('password').if(body('action').equals('create')).isLength({ min: 6 }),
    body('adminId').if(body('action').equals('remove')).isMongoId()
  ],
  validate,
  adminController.manageSuperAdmins
);

// Get system logs
router.get('/logs', adminController.getSystemLogs);

module.exports = router;