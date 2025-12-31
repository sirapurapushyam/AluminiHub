const College = require('../models/College');
const User = require('../models/User');
const Content = require('../models/Content');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Donation = require('../models/Donation');
const emailService = require('../services/emailService');
const { getPaginationParams, generateUniqueCode } = require('../utils/helpers');

const adminController = {
  // Get pending college registrations
  async getPendingColleges(req, res) {
    try {
      const colleges = await College.find({ status: 'pending' })
        .populate('adminUser', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.json({ success: true, colleges });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch pending colleges' });
    }
  },

  // Approve/reject college
  async approveCollege(req, res) {
    try {
      const { collegeId } = req.params;
      const { status, rejectionReason } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const college = await College.findById(collegeId).populate('adminUser');
      if (!college) {
        return res.status(404).json({ success: false, message: 'College not found' });
      }

      college.status = status;
      college.approvedBy = req.user._id;

      if (status === 'approved') {
        // Generate unique code
        let uniqueCode;
        let isUnique = false;
        
        while (!isUnique) {
          uniqueCode = generateUniqueCode(college.name.substring(0, 3));
          const existing = await College.findOne({ uniqueCode });
          if (!existing) isUnique = true;
        }

        college.uniqueCode = uniqueCode;
        college.approvedAt = new Date();
        
        // Update admin user with college code
        if (college.adminUser) {
          college.adminUser.collegeCode = college.uniqueCode;
          college.adminUser.approvalStatus = 'approved';
          college.adminUser.approvedAt = new Date();
          college.adminUser.approvedBy = req.user._id;
          await college.adminUser.save();
        }
        
        await college.save();
        
        // Send approval email
        if (college.adminUser) {
          await emailService.sendWelcomeEmail(college.adminUser, college);
        }
      } else if (status === 'rejected') {
        college.rejectedAt = new Date();
        college.rejectionReason = rejectionReason;
        await college.save();
        
        // Delete admin user if exists
        if (college.adminUser) {
          await User.findByIdAndDelete(college.adminUser._id);
        }

        // Delete the college itself
        await College.findByIdAndDelete(collegeId);

        return res.json({
          success: true,
          message: 'College rejected and deleted successfully'
        });
      }

      res.json({ 
        success: true,
        message: `College ${status} successfully`,
        college: {
          id: college._id,
          name: college.name,
          uniqueCode: college.uniqueCode,
          status: college.status
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update college status' });
    }
  },

  // Get all colleges
  // async getAllColleges(req, res) {
  //   try {
  //     const { status, search, page = 1, limit = 20 } = req.query;
  //     const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);
      
  //     const query = {};

  //     if (status && status !== 'all') {
  //       query.status = status;
  //     }

  //     if (search) {
  //       query.$or = [
  //         { name: { $regex: search, $options: 'i' } },
  //         { uniqueCode: { $regex: search, $options: 'i' } },
  //         { email: { $regex: search, $options: 'i' } }
  //       ];
  //     }

  //     const colleges = await College.find(query)
  //       .populate('adminUser', 'firstName lastName email')
  //       .skip(skip)
  //       .limit(limitNum)
  //       .sort({ createdAt: -1 });

  //     const total = await College.countDocuments(query);

  //     res.json({ 
  //       success: true,
  //       colleges, 
  //       pagination: {
  //         page: pageNum,
  //         limit: limitNum,
  //         total,
  //         pages: Math.ceil(total / limitNum)
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ success: false, message: 'Failed to fetch colleges' });
  //   }
  // },
async getAllColleges(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

    const query = {};
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { uniqueCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const colleges = await College.aggregate([
      { $match: query },

      {
        $lookup: {
          from: 'users',
          localField: 'uniqueCode',
          foreignField: 'collegeCode',
          as: 'users'
        }
      },

      {
  $addFields: {
    stats: {
      totalStudents: {
        $size: {
          $filter: {
            input: '$users',
            cond: {
              $and: [
                { $eq: ['$$this.role', 'student'] },
                { $eq: ['$$this.approvalStatus', 'approved'] }
              ]
            }
          }
        }
      },
      totalAlumni: {
        $size: {
          $filter: {
            input: '$users',
            cond: {
              $and: [
                { $eq: ['$$this.role', 'alumni'] },
                { $eq: ['$$this.approvalStatus', 'approved'] }
              ]
            }
          }
        }
      },
      totalFaculty: {
        $size: {
          $filter: {
            input: '$users',
            cond: {
              $and: [
                { $eq: ['$$this.role', 'faculty'] },
                { $eq: ['$$this.approvalStatus', 'approved'] }
              ]
            }
          }
        }
      },
      totalAdmins: {
        $size: {
          $filter: {
            input: '$users',
            cond: {
              $and: [
                { $eq: ['$$this.role', 'college_admin'] },
                { $eq: ['$$this.approvalStatus', 'approved'] }
              ]
            }
          }
        }
      }
    }
  }
},

     {
  $addFields: {
    'stats.totalUsers': {
      $add: [
        '$stats.totalStudents',
        '$stats.totalAlumni',
        '$stats.totalFaculty',
        '$stats.totalAdmins'
      ]
    }
  }
},

      { $project: { users: 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    const total = await College.countDocuments(query);

    res.json({
      success: true,
      colleges,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch colleges' });
  }
},
  // Get platform statistics
  async getPlatformStats(req, res) {
    try {
      const [
        totalColleges,
        approvedColleges,
        pendingColleges,
        totalUsers,
        usersByRole,
        totalContent,
        totalEvents,
        totalJobs,
        totalDonations
      ] = await Promise.all([
        College.countDocuments(),
        College.countDocuments({ status: 'approved' }),
        College.countDocuments({ status: 'pending' }),
        User.countDocuments({ role: { $ne: 'super_admin' } }),
        User.aggregate([
          { $match: { role: { $ne: 'super_admin' } } },
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        Content.countDocuments({ isActive: true }),
        Event.countDocuments({ isActive: true }),
        Job.countDocuments({ isActive: true }),
        Donation.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ])
      ]);

      const roleStats = {};
      usersByRole.forEach(item => {
        roleStats[item._id] = item.count;
      });

      res.json({
        success: true,
        stats: {
          colleges: {
            total: totalColleges,
            approved: approvedColleges,
            pending: pendingColleges
          },
          users: {
            total: totalUsers,
            byRole: roleStats
          },
          content: {
            total: totalContent
          },
          events: {
            total: totalEvents
          },
          jobs: {
            total: totalJobs
          },
          donations: {
            count: totalDonations[0]?.count || 0,
            total: totalDonations[0]?.total || 0
          }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
  },

  // Manage super admins
  async manageSuperAdmins(req, res) {
    try {
      const { action } = req.body;
      
      if (action === 'list') {
        const superAdmins = await User.find({ role: 'super_admin' })
          .select('-password')
          .sort({ createdAt: -1 });
        
        return res.json({ success: true, superAdmins });
      }
      
      if (action === 'create') {
        const { firstName, lastName, email, password } = req.body;
        
        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        
        const newAdmin = new User({
          firstName,
          lastName,
          email,
          password,
          role: 'super_admin',
          approvalStatus: 'approved',
          approvedAt: new Date()
        });
        
        await newAdmin.save();
        
        res.json({
          success: true,
          message: 'Super admin created successfully',
          admin: {
            id: newAdmin._id,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email
          }
        });
      }
      
      if (action === 'remove') {
        const { adminId } = req.body;
        
        // Prevent removing self
        if (adminId === req.user._id.toString()) {
          return res.status(400).json({ success: false, message: 'Cannot remove yourself' });
        }
        
        // Ensure at least one super admin remains
        const count = await User.countDocuments({ role: 'super_admin' });
        if (count <= 1) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot remove the last super admin' 
          });
        }
        
        await User.findByIdAndDelete(adminId);
        
        res.json({ success: true, message: 'Super admin removed successfully' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to manage super admins' });
    }
  },

  // Get system logs/activity
  async getSystemLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      // In a real application, you would have a separate logs collection
      // For now, we'll aggregate recent activities from various collections

      const activities = [];

      // Recent college approvals
      const recentColleges = await College.find({
        status: { $in: ['approved', 'rejected'] },
        $or: [
          { approvedAt: { $exists: true } },
          { rejectedAt: { $exists: true } }
        ]
      })
      .select('name status approvedAt rejectedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

      recentColleges.forEach(college => {
        activities.push({
          type: 'college_status',
          action: `College ${college.name} was ${college.status}`,
          date: college.approvedAt || college.rejectedAt,
          entity: 'college',
          entityId: college._id
        });
      });

      // Recent user approvals
      const recentUsers = await User.find({
        role: { $ne: 'super_admin' },
        approvalStatus: { $in: ['approved', 'rejected'] },
        $or: [
          { approvedAt: { $exists: true } },
          { rejectedAt: { $exists: true } }
        ]
      })
      .select('firstName lastName email approvalStatus approvedAt rejectedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_status',
          action: `User ${user.email} was ${user.approvalStatus}`,
          date: user.approvedAt || user.rejectedAt,
          entity: 'user',
          entityId: user._id
        });
      });

      // Sort by date
      activities.sort((a, b) => b.date - a.date);

      // Paginate
      const paginatedActivities = activities.slice(skip, skip + limitNum);

      res.json({
        success: true,
        logs: paginatedActivities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: activities.length,
          pages: Math.ceil(activities.length / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch system logs' });
    }
  }
};

module.exports = adminController;