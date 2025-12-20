const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  currency: {
    type: String,
    default: 'INR'
  },
  purpose: {
    type: String,
    enum: ['general', 'infrastructure', 'scholarship', 'event', 'research', 'other'],
    required: true
  },
  purposeDescription: {
    type: String,
    maxLength: 500
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
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet', 'cheque', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  receiptNumber: String,
  receiptUrl: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    maxLength: 500
  },
  processedAt: Date,
  failureReason: String,
  refundedAt: Date,
  refundReason: String
}, {
  timestamps: true
});

// Indexes
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ collegeCode: 1, purpose: 1 });
donationSchema.index({ transactionId: 1 });

// Generate receipt number
donationSchema.pre('save', async function(next) {
  if (!this.receiptNumber && this.status === 'completed') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.receiptNumber = `DON${year}${month}${random}`;
  }
  next();
});

module.exports = mongoose.model('Donation', donationSchema);