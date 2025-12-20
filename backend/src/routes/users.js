const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, requireRole, requireSameCollege, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { upload } = require('../services/cloudinaryService');

const router = express.Router();

// Get pending users for approval
router.get('/pending/:collegeCode', 
  authenticateToken, 
  requireRole('college_admin'), 
  requireSameCollege,
  userController.getPendingUsers
);

// Approve/reject user
router.put('/approval/:userId', 
  authenticateToken, 
  requireRole('college_admin'),
  [
    body('status').isIn(['approved', 'rejected']),
    body('rejectionReason').if(body('status').equals('rejected')).notEmpty()
  ],
  validate,
  userController.approveUser
);

// Get all users in college
router.get('/college/:collegeCode', 
  authenticateToken, 
  requireSameCollege,
  userController.getCollegeUsers
);

// Update user profile with multiple file upload
router.put('/profile', 
  authenticateToken,
  upload('profiles').fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  userController.updateProfile
);

// Get user profile
router.get('/profile/:userId?', 
  authenticateToken, 
  userController.getProfile
);

// Change password
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  validate,
  userController.changePassword
);

// Get current user
router.get('/me',
  authenticateToken,
  (req, res) => {
    const user = req.user.toObject();
    delete user.password;
    res.json({ success: true, user });
  }
);

// Promote user to admin
router.put('/:userId/promote',
  authenticateToken,
  requireRole('college_admin'),
  requireSameCollege,
  userController.promoteUser
);

// Add this route to your userRoutes.js for debugging
router.get('/debug/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({
      success: true,
      skills: user.profile?.skills || [],
      interests: user.profile?.interests || [],
      skillsType: Array.isArray(user.profile?.skills),
      interestsType: Array.isArray(user.profile?.interests),
      profile: user.profile
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;