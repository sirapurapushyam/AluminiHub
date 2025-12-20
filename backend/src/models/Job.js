// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  package: {
    type: String,
    required: true,
    trim: true
  },
  externalLink: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxLength: 1000
  },
  referralAvailable: {
    type: Boolean,
    default: false
  },
  referralCount: {
    type: Number,
    default: 0,
    min: 0
  },
  referralsUsed: {
    type: Number,
    default: 0
  },
  targetAudience: {
    type: String,
    enum: ['my_batch', 'seniors', 'juniors', 'all'],
    required: true
  },
  experienceRequired: {
    type: String,
    enum: ['0-1', '1-3', '3-5', '5+', 'any'],
    default: 'any'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collegeCode: {
    type: String,
    required: true,
    uppercase: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  interestedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedReferral: {
      type: Boolean,
      default: false
    },
    referralGranted: {
      type: Boolean,
      default: false
    },
    interestedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ collegeCode: 1, isActive: 1 });
jobSchema.index({ targetAudience: 1 });
jobSchema.index({ postedBy: 1 });

// Virtual for available referrals
jobSchema.virtual('availableReferrals').get(function() {
  return this.referralCount - this.referralsUsed;
});

module.exports = mongoose.model('Job', jobSchema);