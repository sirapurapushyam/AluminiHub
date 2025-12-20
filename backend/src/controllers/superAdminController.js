const User = require('../models/User');
const College = require('../models/College');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Donation = require('../models/Donation');

const superAdminController = {
  async getDashboardStats(req, res) {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const [
        totalColleges,
        approvedColleges,
        pendingColleges,
        totalUsers,
        totalAdmins,
        totalEvents,
        activeUsers,
        newCollegesThisMonth,
        topColleges
      ] = await Promise.all([
        // Total colleges
        College.countDocuments(),
        
        // Approved colleges
        College.countDocuments({ status: 'approved' }),
        
        // Pending colleges
        College.countDocuments({ status: 'pending' }),
        
        // Total users (excluding super admins)
        User.countDocuments({ role: { $ne: 'super_admin' } }),
        
        // Total college admins
        User.countDocuments({ role: 'college_admin' }),
        
        // Total events across all colleges
        Event.countDocuments(),
        
        // Active users (logged in within last 30 days)
        User.countDocuments({ 
          role: { $ne: 'super_admin' },
          lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
        
        // New colleges this month
        College.countDocuments({ 
          createdAt: { $gte: currentMonth }
        }),
        
        // Top performing colleges with engagement metrics
        College.aggregate([
          { $match: { status: 'approved' } },
          {
            $lookup: {
              from: 'users',
              localField: 'uniqueCode',
              foreignField: 'collegeCode',
              as: 'users'
            }
          },
          {
            $lookup: {
              from: 'events',
              localField: 'uniqueCode',
              foreignField: 'collegeCode',
              as: 'events'
            }
          },
          {
            $project: {
              name: 1,
              uniqueCode: 1,
              userCount: { $size: '$users' },
              eventCount: { $size: '$events' },
              activeUserCount: {
                $size: {
                  $filter: {
                    input: '$users',
                    cond: {
                      $gte: ['$$this.lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
                    }
                  }
                }
              }
            }
          },
          {
            $addFields: {
              engagementRate: {
                $cond: {
                  if: { $eq: ['$userCount', 0] },
                  then: 0,
                  else: {
                    $multiply: [
                      { $divide: ['$activeUserCount', '$userCount'] },
                      100
                    ]
                  }
                }
              }
            }
          },
          { $sort: { engagementRate: -1 } },
          { $limit: 5 },
          {
            $project: {
              _id: 1,
              name: 1,
              uniqueCode: 1,
              userCount: 1,
              eventCount: 1,
              engagementRate: { $round: ['$engagementRate', 1] }
            }
          }
        ])
      ]);

      res.json({
        success: true,
        stats: {
          totalColleges,
          approvedColleges,
          pendingColleges,
          totalUsers,
          totalAdmins,
          totalEvents,
          activeUsers,
          newCollegesThisMonth,
          topColleges
        }
      });
    } catch (error) {
      console.error('SuperAdmin stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch dashboard statistics',
        error: error.message 
      });
    }
  },

  async getPendingColleges(req, res) {
    try {
      const pendingColleges = await College.find({ status: 'pending' })
        .populate('adminUser', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        colleges: pendingColleges
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch pending colleges' 
      });
    }
  }
};

module.exports = superAdminController;