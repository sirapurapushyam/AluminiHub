const College = require('../models/College');
const User = require('../models/User');
const Query = require('../models/Query');
const { getPaginationParams } = require('../utils/helpers');

const collegeController = {
  // Get college details
  async getCollege(req, res) {
    try {
      const college = await College.findOne({ 
        uniqueCode: req.params.collegeCode.toUpperCase() 
      }).populate('adminUser', 'firstName lastName email');

      if (!college) {
        return res.status(404).json({ success: false, message: 'College not found' });
      }

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.collegeCode !== college.uniqueCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, college });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch college details' });
    }
  },

  // Update college details
  async updateCollege(req, res) {
    try {
      const { collegeCode } = req.params;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated
      delete updates.uniqueCode;
      delete updates.status;
      delete updates.adminUser;
      delete updates.approvedBy;
      delete updates.approvedAt;

      const college = await College.findOneAndUpdate(
        { 
          uniqueCode: collegeCode.toUpperCase(),
          adminUser: req.user._id // Ensure only the admin can update
        },
        updates,
        { new: true, runValidators: true }
      );

      if (!college) {
        return res.status(404).json({ success: false, message: 'College not found or unauthorized' });
      }

      res.json({ 
        success: true,
        message: 'College updated successfully',
        college 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update college' });
    }
  },

  // Get college statistics
  async getCollegeStats(req, res) {
    try {
      const collegeCode = req.params.collegeCode.toUpperCase();

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.collegeCode !== collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const [
        totalUsers,
        usersByRole,
        pendingApprovals,
        activeEvents,
        totalJobs,
        totalDonations,
        openQueries,
        recentRegistrations
      ] = await Promise.all([
        User.countDocuments({ collegeCode, approvalStatus: 'approved' }),
        User.aggregate([
          { $match: { collegeCode, approvalStatus: 'approved' } },
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.countDocuments({ collegeCode, approvalStatus: 'pending' }),
        require('../models/Event').countDocuments({
          collegeCode,
          isActive: true,
          eventDate: { $gte: new Date() }
        }),
        require('../models/Job').countDocuments({
          collegeCode,
          isActive: true
        }),
        require('../models/Donation').aggregate([
          { $match: { collegeCode, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Query.countDocuments({ collegeCode, status: 'open' }),
        User.find({ collegeCode, approvalStatus: 'approved' })
          .sort({ approvedAt: -1 })
          .limit(5)
          .select('firstName lastName role profileImage createdAt')
      ]);

      const roleStats = {};
      usersByRole.forEach(item => {
        roleStats[item._id] = item.count;
      });
      res.json({
        success: true,
        stats: {
          totalUsers,
          usersByRole: roleStats,
          pendingApprovals,
          activeEvents,
          totalJobs,
          totalDonations: totalDonations[0]?.total || 0,
          openQueries,
          recentRegistrations
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch college statistics' });
    }
  },

  // Get college activity feed
  async getActivityFeed(req, res) {
    try {
      const { page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);
      const collegeCode = req.params.collegeCode.toUpperCase();

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.collegeCode !== collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // Aggregate recent activities from different collections
      const activities = [];

      // Get recent users
      const recentUsers = await User.find({
        collegeCode,
        approvalStatus: 'approved',
        approvedAt: { $exists: true }
      })
      .select('firstName lastName role approvedAt')
      .sort({ approvedAt: -1 })
      .limit(5);

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_joined',
          description: `${user.firstName} ${user.lastName} joined as ${user.role}`,
          date: user.approvedAt,
          user: user
        });
      });

      // Get recent events
      const recentEvents = await require('../models/Event').find({
        collegeCode,
        isActive: true
      })
      .select('title eventDate createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

      recentEvents.forEach(event => {
        activities.push({
          type: 'event_created',
          description: `New event: ${event.title}`,
          date: event.createdAt,
          event: event
        });
      });

      // Sort activities by date
      activities.sort((a, b) => b.date - a.date);

      // Paginate
      const paginatedActivities = activities.slice(skip, skip + limitNum);

      res.json({
        success: true,
        activities: paginatedActivities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: activities.length,
          pages: Math.ceil(activities.length / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch activity feed' });
    }
  }
};

module.exports = collegeController;