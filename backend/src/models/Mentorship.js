const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
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
  area: {
    type: String,
    required: true,
    enum: ['career', 'academics', 'research', 'entrepreneurship', 'personal_development', 'other']
  },
  description: {
    type: String,
    maxLength: 1000
  },
  goals: [{
    type: String,
    maxLength: 200
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    maxLength: 500
  },
  responseMessage: {
    type: String,
    maxLength: 500
  },
  startDate: Date,
  endDate: Date,
  sessions: [{
    date: Date,
    duration: Number, // in minutes
    notes: String,
    mode: {
      type: String,
      enum: ['online', 'offline', 'phone']
    }
  }],
  feedback: {
    fromMentor: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    },
    fromMentee: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String
    }
  }
}, {
  timestamps: true
});

// Indexes
mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });
mentorshipSchema.index({ collegeCode: 1, area: 1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);