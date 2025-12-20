  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');

  const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  };

  const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    return { resetToken, hashedToken };
  };

  const generateUniqueCode = (prefix, length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix.toUpperCase();
    
    for (let i = prefix.length; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  };

  const sanitizeUser = (user) => {
    const userObject = user.toObject ? user.toObject() : user;
    delete userObject.password;
    delete userObject.__v;
    return userObject;
  };

  const getPaginationParams = (page = 1, limit = 20) => {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    return { skip, limit: limitNum, page: pageNum };
  };

  module.exports = {
    generateToken,
    generateResetToken,
    generateUniqueCode,
    sanitizeUser,
    getPaginationParams
  };