const User = require('../models/User');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Donation = require('../models/Donation');
const Query = require('../models/Query');

const collegeAdminController = {
  async getDashboardStats(req, res) {
    try {
      const collegeCode = req.user.collegeCode;
      
      if (!collegeCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'College code not found' 
        });
      }

      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        newUsersThisMonth,
        activeEvents,
        totalJobs,
        totalDonations,
        openQueries,
        userBreakdown,
        recentRegistrations
      ] = await Promise.all([
        // Total approved users
        User.countDocuments({ 
          collegeCode, 
          approvalStatus: 'approved',
          role: { $ne: 'college_admin' }
        }),
        
        // New users this month
        User.countDocuments({ 
          collegeCode,
          approvalStatus: 'approved',
          role: { $ne: 'college_admin' },
          createdAt: { $gte: currentMonth }
        }),
        
        // Active events
        Event.countDocuments({ 
          collegeCode, 
          isActive: true,
          eventDate: { $gte: new Date() }
        }),
        
        // Total job postings
        Job.countDocuments({ 
          collegeCode, 
          isActive: true 
        }),
        
        // Total donations
        Donation.aggregate([
          { $match: { collegeCode, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(result => result[0]?.total || 0),
        
        // Open queries
        Query.countDocuments({ 
          collegeCode, 
          status: { $in: ['open', 'in_progress'] }
        }),
        
        // User breakdown by role
        User.aggregate([
          { 
            $match: { 
              collegeCode, 
              approvalStatus: 'approved',
              role: { $ne: 'college_admin' }
            } 
          },
          { 
            $group: { 
              _id: '$role', 
              count: { $sum: 1 } 
            } 
          }
        ]).then(results => {
          const breakdown = { students: 0, alumni: 0, faculty: 0 };
          results.forEach(r => {
            if (r._id === 'student') breakdown.students = r.count;
            else if (r._id === 'alumni') breakdown.alumni = r.count;
            else if (r._id === 'faculty') breakdown.faculty = r.count;
          });
          return breakdown;
        }),
        
        // Recent registrations (last 5)
        User.find({ 
          collegeCode,
          role: { $ne: 'college_admin' }
        })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('firstName lastName email role profileImage createdAt')
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers,
          newUsersThisMonth,
          activeEvents,
          totalJobs,
          totalDonations,
          openQueries,
          userBreakdown,
          recentRegistrations
        }
      });
    } catch (error) {
      console.error('College admin stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch dashboard statistics',
        error: error.message 
      });
    }
  }
};

module.exports = collegeAdminController;