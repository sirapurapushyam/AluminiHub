const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['student', 'alumni', 'faculty', 'college_admin'],
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
  subject: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 5000
  },
  category: {
    type: String,
    enum: ['technical', 'account', 'events', 'jobs', 'mentorship', 'general', 'academic', 'administrative'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    maxLength: 5000
  },
  resolvedAt: Date,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    url: String,
    publicId: String,
    filename: String
  }]
}, {
  timestamps: true
});

// Indexes
querySchema.index({ collegeCode: 1, status: 1 });
querySchema.index({ user: 1 });
querySchema.index({ userRole: 1 });
querySchema.index({ category: 1 });

module.exports = mongoose.model('Query', querySchema);