const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minLength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'faculty', 'college_admin', 'super_admin'],
    required: true
  },
  collegeCode: {
    type: String,
    required: function() {
      return this.role !== 'super_admin';
    },
    uppercase: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      return this.role === 'college_admin' || this.role === 'super_admin' ? 'approved' : 'pending';
    }
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  
  // Profile image at root level
  profileImage: String,
  profileImagePublicId: String,
  
  // Role-specific fields
  studentId: {
    type: String,
    trim: true,
    sparse: true
  },
  course: String,
  yearOfStudy: Number,
  employeeId: {
    type: String,
    trim: true,
    sparse: true
  },
  department: String,
  designation: String,
  degree: String,
  
  // UPDATED: Profile subdocument with resume metadata
  profile: {
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: Date,
    graduationYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 10
    },
    company: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxLength: 500
    },
    // UPDATED: Resume fields with metadata
    resume: String,
    resumePublicId: String,
    resumeOriginalName: String,  // Store original filename
    resumeMimeType: String,      // Store MIME type
    resumeUploadedAt: {          // Track when resume was uploaded/updated
      type: Date,
      default: Date.now
    },
    linkedIn: String,
    github: String,
    website: String,
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function(array) {
          return array.every(skill => typeof skill === 'string' && skill.trim().length > 0);
        },
        message: 'All skills must be non-empty strings'
      }
    },
    interests: {
      type: [String],
      default: [],
      validate: {
        validator: function(array) {
          return array.every(interest => typeof interest === 'string' && interest.trim().length > 0);
        },
        message: 'All interests must be non-empty strings'
      }
    },
    location: String
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    events: {
      type: Boolean,
      default: true
    },
    jobs: {
      type: Boolean,
      default: true
    },
    mentorship: {
      type: Boolean,
      default: true
    },
    messages: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Ensure skills and interests are always arrays
      if (ret.profile) {
        ret.profile.skills = ret.profile.skills || [];
        ret.profile.interests = ret.profile.interests || [];
      }
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Ensure skills and interests are always arrays
      if (ret.profile) {
        ret.profile.skills = ret.profile.skills || [];
        ret.profile.interests = ret.profile.interests || [];
      }
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1, collegeCode: 1 });
userSchema.index({ role: 1, collegeCode: 1 });
userSchema.index({ approvalStatus: 1, collegeCode: 1 });
userSchema.index({ googleId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// UPDATED: Pre-save middleware with resume timestamp update
userSchema.pre('save', function(next) {
  // Initialize profile if it doesn't exist
  if (!this.profile) {
    this.profile = {};
  }
  
  // Ensure skills is an array and clean it
  if (!Array.isArray(this.profile.skills)) {
    this.profile.skills = [];
  } else {
    this.profile.skills = this.profile.skills
      .filter(skill => skill && typeof skill === 'string')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
  
  // Ensure interests is an array and clean it
  if (!Array.isArray(this.profile.interests)) {
    this.profile.interests = [];
  } else {
    this.profile.interests = this.profile.interests
      .filter(interest => interest && typeof interest === 'string')
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
  }
  
  // Update resume timestamp if resume was modified
  if (this.isModified('profile.resume') && this.profile.resume) {
    this.profile.resumeUploadedAt = new Date();
  }
  
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Check if user can be mentor
userSchema.methods.canBeMentor = function() {
  return ['alumni', 'faculty'].includes(this.role) && 
         this.approvalStatus === 'approved';
};

module.exports = mongoose.model('User', userSchema);