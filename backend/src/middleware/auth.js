const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .populate('college')
      .select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const requireApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'super_admin') {
    return next();
  }

  if (req.user.approvalStatus !== 'approved') {
    return res.status(403).json({ 
      message: 'Account pending approval',
      approvalStatus: req.user.approvalStatus 
    });
  }

  next();
};

const requireSameCollege = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'super_admin') {
    return next();
  }

  const collegeCode = req.params.collegeCode || req.body.collegeCode;
  if (collegeCode && req.user.collegeCode !== collegeCode) {
    return res.status(403).json({ message: 'Access denied to this college' });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireApproval,
  requireSameCollege,
  JWT_SECRET
};