const express = require('express');
const superAdminController = require('../controllers/superAdminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, requireRole('super_admin'));
router.get('/dashboard/stats', superAdminController.getDashboardStats);
router.get('/pending-colleges', superAdminController.getPendingColleges);

module.exports = router;