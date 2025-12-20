const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
    unique: true
  },
  uniqueCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    minLength: 6,
    maxLength: 10
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    }
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid website URL'
    }
  },
  establishedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  type: {
    type: String,
    enum: ['university', 'college', 'institute', 'school'],
    default: 'college'
  },
  accreditation: {
    body: String,
    status: {
      type: String,
      enum: ['accredited', 'pending', 'not_accredited'],
      default: 'not_accredited'
    },
    validUntil: Date
  },
  logo: String,
  banner: String,
  description: {
    type: String,
    maxLength: 2000
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  additionalAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    allowStudentRegistration: {
      type: Boolean,
      default: true
    },
    allowAlumniRegistration: {
      type: Boolean,
      default: true
    },
    allowFacultyRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    autoApproveStudents: {
      type: Boolean,
      default: false
    },
    autoApproveAlumni: {
      type: Boolean,
      default: false
    },
    autoApproveFaculty: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalAlumni: {
      type: Number,
      default: 0
    },
    totalFaculty: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    totalJobs: {
      type: Number,
      default: 0
    }
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  suspendedAt: Date,
  suspensionReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
collegeSchema.index({ uniqueCode: 1 });
collegeSchema.index({ status: 1 });
collegeSchema.index({ name: 'text', email: 'text' });

// Virtual for full address
collegeSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return `${street}, ${city}, ${state} ${zipCode}, ${country}`;
});

// Generate unique college code
collegeSchema.methods.generateUniqueCode = function() {
  const prefix = this.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  this.uniqueCode = prefix + suffix;
};

// Update stats
collegeSchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  const Event = mongoose.model('Event');
  const Job = mongoose.model('Job');
  
  const [students, alumni, faculty, events, jobs] = await Promise.all([
    User.countDocuments({ collegeCode: this.uniqueCode, role: 'student', approvalStatus: 'approved' }),
    User.countDocuments({ collegeCode: this.uniqueCode, role: 'alumni', approvalStatus: 'approved' }),
    User.countDocuments({ collegeCode: this.uniqueCode, role: 'faculty', approvalStatus: 'approved' }),
    Event.countDocuments({ collegeCode: this.uniqueCode, isActive: true }),
    Job.countDocuments({ collegeCode: this.uniqueCode, isActive: true })
  ]);
  
  this.stats = {
    totalStudents: students,
    totalAlumni: alumni,
    totalFaculty: faculty,
    totalEvents: events,
    totalJobs: jobs
  };
  
  await this.save();
};

module.exports = mongoose.model('College', collegeSchema);