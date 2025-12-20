const express = require('express');
const { body } = require('express-validator');
const donationController = require('../controllers/donationController');
const { authenticateToken, requireApproval, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Create donation
router.post('/',
  authenticateToken,
  requireApproval,
  [
    body('amount').isNumeric().isFloat({ min: 1 }),
    body('purpose').isIn(['general', 'infrastructure', 'scholarship', 'event', 'research', 'other']),
    body('paymentMethod').isIn(['card', 'netbanking', 'upi', 'wallet', 'cheque', 'cash']),
    body('transactionId').notEmpty(),
    body('purposeDescription').optional().isLength({ max: 500 }),
    body('message').optional().isLength({ max: 500 })
  ],
  validate,
  donationController.createDonation
);

// Get donations (admin)
router.get('/college/:collegeCode',
  authenticateToken,
  requireRole('college_admin'),
  donationController.getDonations
);

// Get my donations
router.get('/my-donations',
  authenticateToken,
  requireApproval,
  donationController.getMyDonations
);

// Update donation status (admin)
router.put('/:donationId/status',
  authenticateToken,
  requireRole('college_admin'),
  [
    body('status').isIn(['completed', 'failed', 'refunded']),
    body('reason').optional()
  ],
  validate,
  donationController.updateDonationStatus
);

// Get donation statistics
router.get('/stats/:collegeCode',
  authenticateToken,
  requireRole('college_admin'),
  donationController.getDonationStats
);

// Generate donation receipt
router.get('/:donationId/receipt',
  authenticateToken,
  donationController.getReceipt
);

module.exports = router;