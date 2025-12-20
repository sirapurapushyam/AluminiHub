const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const College = require('../models/College');
const PasswordReset = require('../models/PasswordReset');
const emailService = require('../services/emailService');
const { generateToken, generateResetToken, sanitizeUser } = require('../utils/helpers');

const authController = {
  // Register college
  async registerCollege(req, res) {
    try {
      const {
        name, email, phone, address, website, establishedYear,
        adminFirstName, adminLastName, adminEmail, adminPassword
      } = req.body;

      // Check if college already exists
      const existingCollege = await College.findOne({ 
        $or: [{ email }, { name }] 
      });
      if (existingCollege) {
        return res.status(400).json({ success: false, message: 'College already registered' });
      }

      // Check if admin email already exists
      const existingUser = await User.findOne({ email: adminEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Admin email already registered' });
      }

      // Create college
      const college = new College({
        name, email, phone, address, website, establishedYear
      });

      // Create college admin user
      const adminUser = new User({
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        password: adminPassword,
        role: 'college_admin',
        approvalStatus: 'pending',
        collegeCode: "PENDING"
      });

      await college.save();
      
      // Link admin to college
      adminUser.college = college._id;
      await adminUser.save();
      
      college.adminUser = adminUser._id;
      await college.save();

      res.status(201).json({
        success: true,
        message: 'College registration submitted successfully. Awaiting admin approval.',
        collegeId: college._id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

  // Register user
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, role, collegeCode, profile } = req.body;

      let collegeId = null;
      if (role !== 'super_admin') {
        const college = await College.findOne({ uniqueCode: collegeCode, status: 'approved' });
        if (!college) {
          return res.status(400).json({ success: false, message: 'Invalid college code' });
        }
        collegeId = college._id;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        email,
        ...(role !== 'super_admin' ? { collegeCode } : {})
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already registered' });
      }

      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        collegeCode: role !== 'super_admin' ? collegeCode : undefined,
        college: collegeId,
        profile
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: role === 'super_admin'
          ? 'Super Admin registered successfully.'
          : 'Registration successful. Awaiting admin approval.',
        userId: user._id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

async login(req, res) {
  try {
    const { email, password, collegeCode } = req.body;

    const query = { email };
    if (collegeCode) {
      query.collegeCode = collegeCode;
    }

    const user = await User.findOne(query).populate('college');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    if (user.role !== 'super_admin' && user.approvalStatus !== 'approved') {
      return res.status(403).json({ 
        success: false,
        message: user.approvalStatus === 'rejected' 
          ? 'Your account has been rejected' 
          : 'Your account is pending approval'
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
},

  // Verify college code
  async verifyCollege(req, res) {
    try {
      const college = await College.findOne({ 
        uniqueCode: req.params.code.toUpperCase(),
        status: 'approved'
      });
      
      if (!college) {
        return res.status(404).json({ success: false, message: 'College not found or not approved' });
      }

      res.json({
        success: true,
        college: {
          id: college._id,
          name: college.name,
          uniqueCode: college.uniqueCode,
          email: college.email,
          website: college.website
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Verification failed' });
    }
  },

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email, collegeCode } = req.body;
      const query = { email };
      if (collegeCode) {
        query.collegeCode = collegeCode;
      }

      const user = await User.findOne(query);
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({ 
          success: true,
          message: 'If the email exists, a password reset link has been sent' 
        });
      }

      // Generate reset token
      const { resetToken, hashedToken } = generateResetToken();
      
      // Save reset token
      const passwordReset = new PasswordReset({
        user: user._id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      });
      await passwordReset.save();

      // Send email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
      await emailService.sendPasswordResetEmail(user, resetUrl);

      res.json({ 
        success: true,
        message: 'If the email exists, a password reset link has been sent' 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to process request' });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, email, password } = req.body;
      
      // Hash token to compare with stored version
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find valid reset token
      const passwordReset = await PasswordReset.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
        used: false
      }).populate('user');

      if (!passwordReset || passwordReset.user.email !== email) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid or expired reset token' 
        });
      }

      // Update password
      passwordReset.user.password = password;
      await passwordReset.user.save();

      // Mark token as used
      passwordReset.used = true;
      await passwordReset.save();

      res.json({ 
        success: true,
        message: 'Password reset successful' 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  },

  // Verify token
  async verifyToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId)
        .populate('college')
        .select('-password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      res.json({
        success: true,
        user: sanitizeUser(user)
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
      }

      // In a production app, you would verify the refresh token from a database
      // For now, we'll just decode and generate a new access token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      const newAccessToken = generateToken(user._id);

      res.json({
        success: true,
        token: newAccessToken
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
  }
};

module.exports = authController;