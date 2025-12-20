const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  content: {
    type: String,
    maxLength: 10000
  },
  excerpt: {
    type: String,
    maxLength: 300
  },
  type: {
    type: String,
    enum: ['announcement', 'event', 'news', 'article', 'notice'],
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: String,
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  eventDetails: {
    eventDate: Date,
    eventEndDate: Date,
    eventTime: String,
    eventLocation: String,
    eventVenue: String,
    registrationRequired: {
      type: Boolean,
      default: false
    },
    registrationDeadline: Date,
    maxAttendees: Number
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public'
  },
  targetRoles: [{
    type: String,
    enum: ['student', 'alumni', 'faculty', 'all'],
    default: ['all']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'published'
  },
  publishedAt: Date,
  scheduledAt: Date,
  expiresAt: Date,
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxLength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contentSchema.index({ collegeCode: 1, type: 1, createdAt: -1 });
contentSchema.index({ college: 1, isActive: 1 });
contentSchema.index({ slug: 1 });
contentSchema.index({ title: 'text', description: 'text' });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ targetRoles: 1 });

// Virtual for comment count
contentSchema.virtual('commentCount').get(function() {
  return this.comments.filter(c => c.isApproved).length;
});

// Virtual for like count
contentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Generate slug before saving
contentSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    // Add timestamp to ensure uniqueness
    this.slug += '-' + Date.now();
  }
  
  // Set publishedAt if publishing
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.description) {
    this.excerpt = this.description.substring(0, 250) + '...';
  }
  
  next();
});

// Method to increment views
contentSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to toggle like
contentSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  
  await this.save();
  return likeIndex === -1; // Return true if liked, false if unliked
};

// Method to add comment
contentSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    user: userId,
    text,
    isApproved: true // Auto-approve for now
  });
  
  await this.save();
};

module.exports = mongoose.model('Content', contentSchema);