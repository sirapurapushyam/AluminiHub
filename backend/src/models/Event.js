const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventEndDate: {
    type: Date
  },
  location: {
    type: String,
    required: true
  },
  venue: {
    type: String
  },
  eventType: {
    type: String,
    enum: ['reunion', 'seminar', 'workshop', 'cultural', 'sports', 'other'],
    required: true
  },
  targetRoles: [{
    type: String,
    enum: ['student', 'alumni', 'faculty', 'all']
  }],
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
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  registrationDeadline: {
    type: Date
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  eventImage: {
    type: String
  },
  eventImagePublicId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ collegeCode: 1, eventDate: 1 });
eventSchema.index({ eventType: 1, isActive: 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(a => a.status !== 'cancelled').length;
});

// Virtual for available seats
eventSchema.virtual('availableSeats').get(function() {
  if (!this.maxAttendees) return null;
  return this.maxAttendees - this.attendeeCount;
});

// Ensure virtuals are included in JSON responses
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);