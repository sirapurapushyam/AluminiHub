const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { deleteFile } = require('../services/cloudinaryService');

// Helper function to sanitize user data
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  return userObj;
};

const userController = {
  // Get pending users
  async getPendingUsers(req, res) {
    try {
      const users = await User.find({
        collegeCode: req.params.collegeCode,
        approvalStatus: 'pending'
      }).select('-password').populate('college', 'name uniqueCode');

      res.json({ success: true, users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch pending users' });
    }
  },

  // Approve user
  async approveUser(req, res) {
    try {
      const { status, rejectionReason } = req.body;
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (req.user.collegeCode !== user.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      user.approvalStatus = status;
      if (status === 'approved') {
        user.approvedAt = new Date();
        user.approvedBy = req.user._id;
      } else if (status === 'rejected') {
        user.rejectedAt = new Date();
        user.rejectionReason = rejectionReason;
      }

      await user.save();

      res.json({ success: true, message: `User ${status} successfully` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update user status' });
    }
  },

  // Get college users
  // async getCollegeUsers(req, res) {
  //   try {
  //     const { role, search, page = 1, limit = 20 } = req.query;
  //     const query = { collegeCode: req.params.collegeCode };

  //     if (role) query.role = role;
  //     if (search) {
  //       query.$or = [
  //         { firstName: { $regex: search, $options: 'i' } },
  //         { lastName: { $regex: search, $options: 'i' } },
  //         { email: { $regex: search, $options: 'i' } }
  //       ];
  //     }

  //     const users = await User.find(query)
  //       .select('-password')
  //       .populate('college', 'name uniqueCode')
  //       .sort({ createdAt: -1 })
  //       .limit(limit * 1)
  //       .skip((page - 1) * limit);

  //     const total = await User.countDocuments(query);

  //     res.json({
  //       success: true,
  //       users,
  //       pagination: {
  //         page: parseInt(page),
  //         pages: Math.ceil(total / limit),
  //         total
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ success: false, message: 'Failed to fetch users' });
  //   }
  // },
  // In userController.js, update getCollegeUsers method:
async getCollegeUsers(req, res) {
  try {
    const { role, search, approvalStatus, page = 1, limit = 20 } = req.query;
    const query = { collegeCode: req.params.collegeCode };

    if (role && role !== 'all') query.role = role;
    if (approvalStatus && approvalStatus !== 'all') query.approvalStatus = approvalStatus;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('college', 'name uniqueCode')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);
    const statusCounts = await User.aggregate([
  { $match: query },
  {
    $group: {
      _id: '$approvalStatus',
      count: { $sum: 1 }
    }
  }
])

const approvalStats = { pending: 0, approved: 0, rejected: 0 }
statusCounts.forEach(s => {
  approvalStats[s._id] = s.count
})

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      approvalStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
},

  // COMPLETELY FIXED Update user profile
  async updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    // Update top-level fields
    const topLevelFields = ['firstName', 'lastName', 'studentId', 'employeeId', 'department', 'designation', 'course', 'yearOfStudy'];
    topLevelFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        user[field] = req.body[field];
      }
    });

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile fields
    const profileFields = ['phone', 'bio', 'company', 'position', 'linkedIn', 'github', 'website', 'graduationYear', 'location'];
    profileFields.forEach(field => {
      const value = req.body[`profile.${field}`] || req.body[`profile_${field}`];
      if (value !== undefined && value !== '') {
        user.profile[field] = value;
      }
    });

    // Handle skills
    if (req.body.skills) {
      let skillsArray = [];
      if (typeof req.body.skills === 'string') {
        skillsArray = req.body.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(req.body.skills)) {
        skillsArray = req.body.skills.filter(skill => skill && skill.trim());
      }
      user.profile.skills = skillsArray;
    } else {
      user.profile.skills = user.profile.skills || [];
    }

    // Handle interests
    if (req.body.interests) {
      let interestsArray = [];
      if (typeof req.body.interests === 'string') {
        interestsArray = req.body.interests.split(',').map(interest => interest.trim()).filter(interest => interest);
      } else if (Array.isArray(req.body.interests)) {
        interestsArray = req.body.interests.filter(interest => interest && interest.trim());
      }
      user.profile.interests = interestsArray;
    } else {
      user.profile.interests = user.profile.interests || [];
    }

    // Handle file uploads
    if (req.files) {
      // Handle profile image
      if (req.files.profileImage && req.files.profileImage[0]) {
        if (user.profileImagePublicId) {
          await deleteFile(user.profileImagePublicId);
        }
        user.profileImage = req.files.profileImage[0].path;
        user.profileImagePublicId = req.files.profileImage[0].filename;
        console.log('Profile image uploaded:', {
          path: user.profileImage,
          publicId: user.profileImagePublicId
        });
      }

      // FIXED: Handle resume upload with replacement logic
      if (req.files.resume && req.files.resume[0]) {
        const resumeFile = req.files.resume[0];
        console.log('=== RESUME UPLOAD DEBUG ===');
        console.log('Resume file details:', {
          originalname: resumeFile.originalname,
          mimetype: resumeFile.mimetype,
          size: resumeFile.size,
          path: resumeFile.path,
          filename: resumeFile.filename
        });

        // Store new resume details (keep same public_id if it was a replacement)
        user.profile.resumePublicId = resumeFile.filename;
        user.profile.resumeOriginalName = resumeFile.originalname;
        user.profile.resumeMimeType = resumeFile.mimetype;
        // Generate and store the correct Cloudinary raw URL for viewing
        const { getViewingUrl } = require('../services/cloudinaryService');
        user.profile.resume = getViewingUrl(resumeFile.filename, resumeFile.mimetype);

        console.log('Resume stored/updated:', {
          url: user.profile.resume,
          publicId: user.profile.resumePublicId,
          originalName: user.profile.resumeOriginalName,
          mimeType: user.profile.resumeMimeType
        });
      }
    }

    // Handle resume removal
    if (req.body.removeResume === 'true') {
      console.log('Removing resume...');
      if (user.profile.resumePublicId) {
        await deleteFile(user.profile.resumePublicId);
      }
      user.profile.resume = undefined;
      user.profile.resumePublicId = undefined;
      user.profile.resumeOriginalName = undefined;
      user.profile.resumeMimeType = undefined;
    }

    // Mark nested fields as modified
    user.markModified('profile.skills');
    user.markModified('profile.interests');
    user.markModified('profile');

    const updatedUser = await user.save();

    console.log('=== FINAL SAVE RESULT ===');
    console.log('Updated skills:', updatedUser.profile.skills);
    console.log('Updated interests:', updatedUser.profile.interests);
    console.log('Updated resume:', updatedUser.profile.resume);

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
},

  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.params.userId || req.user._id;
      
      const user = await User.findById(userId)
        .select('-password')
        .populate('college', 'name uniqueCode');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Check permissions
      if (req.user.role !== 'super_admin' && 
          req.user.collegeCode !== user.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to change password' });
    }
  },

  // Promote user
  async promoteUser(req, res) {
    try {
      const user = await User.findById(req.params.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.collegeCode !== req.user.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      if (user.role === 'college_admin') {
        return res.status(400).json({ success: false, message: 'User is already an admin' });
      }

      user.role = 'college_admin';
      user.approvalStatus = 'approved';
      await user.save();

      res.json({ success: true, message: 'User promoted to admin successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to promote user' });
    }
  }
};

module.exports = userController;