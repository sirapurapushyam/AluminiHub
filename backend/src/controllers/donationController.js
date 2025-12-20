const Donation = require('../models/Donation');
const { getPaginationParams } = require('../utils/helpers');

const donationController = {
  // Create donation
  async createDonation(req, res) {
    try {
      const {
        amount, purpose, purposeDescription, paymentMethod,
        transactionId, isAnonymous, message
      } = req.body;

      // Check for duplicate transaction
      const existing = await Donation.findOne({ transactionId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Transaction ID already exists' });
      }

      const donation = new Donation({
        donor: req.user._id,
        amount,
        purpose,
        purposeDescription,
        paymentMethod,
        transactionId,
        isAnonymous,
        message,
        collegeCode: req.user.collegeCode,
        college: req.user.college._id
      });

      await donation.save();
      await donation.populate('donor', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'Donation recorded successfully',
        donation
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to record donation' });
    }
  },

  // Get donations (admin)
  async getDonations(req, res) {
    try {
      const { purpose, status, startDate, endDate, page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const query = {
        collegeCode: req.params.collegeCode.toUpperCase()
      };

      if (purpose && purpose !== 'all') {
        query.purpose = purpose;
      }

      if (status && status !== 'all') {
        query.status = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const donations = await Donation.find(query)
        .populate({
          path: 'donor',
          select: req.user.role === 'college_admin' ? 'firstName lastName email' : 'firstName lastName'
        })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await Donation.countDocuments(query);

      // Calculate total amount
      const totalAmount = await Donation.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      res.json({
        success: true,
        donations,
        totalAmount: totalAmount[0]?.total || 0,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch donations' });
    }
  },

  // Get my donations
  async getMyDonations(req, res) {
    try {
      const { page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const donations = await Donation.find({ donor: req.user._id })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await Donation.countDocuments({ donor: req.user._id });

      // Calculate total donated
      const totalDonated = await Donation.aggregate([
        { $match: { donor: req.user._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      res.json({
        success: true,
        donations,
        totalDonated: totalDonated[0]?.total || 0,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch donations' });
    }
  },

  // Update donation status
  async updateDonationStatus(req, res) {
    try {
      const { status, reason } = req.body;
      const donation = await Donation.findOne({
        _id: req.params.donationId,
        collegeCode: req.user.collegeCode
      });

      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      donation.status = status;
      
      if (status === 'completed') {
        donation.processedAt = new Date();
      } else if (status === 'failed') {
        donation.failureReason = reason;
      } else if (status === 'refunded') {
        donation.refundedAt = new Date();
        donation.refundReason = reason;
      }

      await donation.save();

      res.json({
        success: true,
        message: 'Donation status updated',
        donation
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update donation' });
    }
  },

  // Get donation statistics
  async getDonationStats(req, res) {
    try {
      const collegeCode = req.params.collegeCode.toUpperCase();

      const stats = await Donation.aggregate([
        { $match: { collegeCode, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonations: { $sum: 1 },
            avgDonation: { $avg: '$amount' },
            maxDonation: { $max: '$amount' }
          }
        }
      ]);

      const purposeStats = await Donation.aggregate([
        { $match: { collegeCode, status: 'completed' } },
        {
          $group: {
            _id: '$purpose',
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      const monthlyStats = await Donation.aggregate([
        { $match: { collegeCode, status: 'completed' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      const topDonors = await Donation.aggregate([
        { $match: { collegeCode, status: 'completed', isAnonymous: false } },
        {
          $group: {
            _id: '$donor',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'donor'
          }
        },
        { $unwind: '$donor' },
        {
          $project: {
            'donor.password': 0,
            'donor.__v': 0
          }
        }
      ]);

      res.json({
        success: true,
        stats: stats[0] || {
          totalAmount: 0,
          totalDonations: 0,
          avgDonation: 0,
          maxDonation: 0
        },
        purposeStats,
        monthlyStats,
        topDonors
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch donation statistics' });
    }
  },

  // Generate receipt
  async getReceipt(req, res) {
    try {
      const donation = await Donation.findOne({
        _id: req.params.donationId,
        $or: [
          { donor: req.user._id },
          { collegeCode: req.user.collegeCode } // Admin can access all receipts
        ],
        status: 'completed'
      })
      .populate('donor', 'firstName lastName email')
      .populate('college', 'name address phone email');

      if (!donation) {
        return res.status(404).json({ success: false, message: 'Donation not found' });
      }

      // For now, return receipt data. In production, you'd generate a PDF
      const receipt = {
        receiptNumber: donation.receiptNumber,
        date: donation.processedAt || donation.createdAt,
        donor: donation.isAnonymous ? 'Anonymous' : `${donation.donor.firstName} ${donation.donor.lastName}`,
        amount: donation.amount,
        purpose: donation.purpose,
        purposeDescription: donation.purposeDescription,
        paymentMethod: donation.paymentMethod,
        transactionId: donation.transactionId,
        college: donation.college,
        message: donation.message
      };

      res.json({
        success: true,
        receipt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to generate receipt' });
    }
  }
};

module.exports = donationController;