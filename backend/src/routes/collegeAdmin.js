const express = require('express');
const collegeAdminController = require('../controllers/collegeAdminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, requireRole('college_admin'));
router.get('/dashboard/stats', collegeAdminController.getDashboardStats);

module.exports = router;