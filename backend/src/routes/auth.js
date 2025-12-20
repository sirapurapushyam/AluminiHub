
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const College = require('../models/College');
const User = require('../models/User');
const { validate } = require('../middleware/validation');
const { generateToken, sanitizeUser } = require('../utils/helpers'); 

const router = express.Router();

// College code autocomplete/search (for validation)
router.get('/college-codes/search', async (req, res) => {
  try {
    const { prefix } = req.query;
    if (!prefix || prefix.length < 1) {
      return res.status(400).json({ success: false, message: 'Prefix required' });
    }
    // Find all college codes starting with prefix (case-insensitive)
    const codes = await College.find({
      uniqueCode: { $regex: `^${prefix}`, $options: 'i' },
      status: 'approved'
    }).select('uniqueCode -_id');
    res.json({ success: true, codes: codes.map(c => c.uniqueCode) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to search college codes' });
  }
});



// Google Auth - Initial request
router.post('/google/verify-college', [
  body('collegeCode').notEmpty().trim().toUpperCase()
], validate, async (req, res) => {
  try {
    const { collegeCode } = req.body;
    
    // Verify college exists and is approved
    const college = await College.findOne({ 
      uniqueCode: collegeCode, 
      status: 'approved' 
    });
    
    if (!college) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or inactive college code' 
      });
    }
    
    // Generate a temporary token to store college code
    const tempToken = jwt.sign(
      { collegeCode, collegeId: college._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '10m' }
    );
    
    res.json({
      success: true,
      tempToken,
      college: {
        name: college.name,
        uniqueCode: college.uniqueCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Google Auth - Initiate OAuth flow
router.get('/google', (req, res) => {
  const { tempToken } = req.query;
  
  if (!tempToken) {
    return res.status(400).json({ 
      success: false, 
      message: 'College verification required' 
    });
  }
  
  // Store tempToken in session or pass it through state parameter
  const state = Buffer.from(JSON.stringify({ tempToken })).toString('base64');
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res);
});

// Google Auth - Callback
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  async (req, res) => {
    try {
      // Extract state parameter
      const state = req.query.state;
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { tempToken } = stateData;
      
      // Verify temp token
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      const { collegeCode, collegeId } = decoded;
      
      if (req.user) {
        // User already exists, generate token
        const token = generateToken(req.user._id);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
      }
      
      // New user - get profile from auth info
      const profile = req.authInfo.profile;
      
      res.redirect(`${process.env.FRONTEND_URL}/auth/google/complete?` + 
        `email=${profile.emails[0].value}&` +
        `firstName=${profile.name.givenName}&` +
        `lastName=${profile.name.familyName}&` +
        `googleId=${profile.id}&` +
        `collegeCode=${collegeCode}&` +
        `tempToken=${tempToken}`
      );
    } catch (error) {
      console.error(error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
    }
  }
);

// Complete Google registration
router.post('/google/complete', [
  body('email').isEmail().normalizeEmail(),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('googleId').notEmpty(),
  body('collegeCode').notEmpty(),
  body('role').isIn(['student', 'alumni', 'faculty']),
  body('tempToken').notEmpty()
], validate, async (req, res) => {
  try {
    const { email, firstName, lastName, googleId, collegeCode, role, tempToken, profile } = req.body;
    
    // Verify temp token
    try {
      jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired session' 
      });
    }
    
    // Verify college
    const college = await College.findOne({ 
      uniqueCode: collegeCode, 
      status: 'approved' 
    });
    
    if (!college) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid college code' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { googleId }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      googleId,
      role,
      collegeCode,
      college: college._id,
      isEmailVerified: true, // Email is verified via Google
      profile: profile || {}
    });
    
    await user.save();
    
    // Generate token if auto-approval is enabled
    let token = null;
    if (
      (role === 'student' && college.settings.autoApproveStudents) ||
      (role === 'alumni' && college.settings.autoApproveAlumni) ||
      (role === 'faculty' && college.settings.autoApproveFaculty)
    ) {
      user.approvalStatus = 'approved';
      user.approvedAt = new Date();
      await user.save();
      token = generateToken(user._id);
    }
    
    res.status(201).json({
      success: true,
      message: token 
        ? 'Registration successful' 
        : 'Registration successful. Awaiting admin approval.',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Google Auth failure
router.get('/google/failure', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
});

// College registration
router.post('/register-college', [
  body('name').notEmpty().trim().isLength({ min: 2, max: 200 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
  body('address.street').notEmpty().trim(),
  body('address.city').notEmpty().trim(),
  body('address.state').notEmpty().trim(),
  body('address.zipCode').notEmpty().trim(),
  body('address.country').notEmpty().trim(),
  body('website').optional().isURL(),
  body('establishedYear').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('adminFirstName').notEmpty().trim().isLength({ max: 50 }),
  body('adminLastName').notEmpty().trim().isLength({ max: 50 }),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPassword').isLength({ min: 6 })
], validate, authController.registerCollege);

// User registration
router.post('/register', [
  body('firstName').notEmpty().trim().isLength({ max: 50 }),
  body('lastName').notEmpty().trim().isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['student', 'alumni', 'faculty', 'college_admin', 'super_admin']),
  body('collegeCode').if(body('role').not().equals('super_admin')).notEmpty(),
  body('profile.phone').optional().isMobilePhone(),
  body('profile.dateOfBirth').optional().isISO8601(),
  body('profile.graduationYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 10 }),
  body('profile.department').optional().trim(),
  body('profile.designation').optional().trim(),
  body('profile.company').optional().trim(),
  body('profile.position').optional().trim(),
  body('profile.bio').optional().isLength({ max: 500 })
], validate, authController.register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('collegeCode').optional().trim().toUpperCase()
], validate, authController.login);

// Verify college code
router.get('/verify-college/:code', authController.verifyCollege);

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
  body('collegeCode').optional().trim().toUpperCase()
], validate, authController.forgotPassword);

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], validate, authController.resetPassword);

// Verify token
router.get('/verify-token', authController.verifyToken);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

module.exports = router;