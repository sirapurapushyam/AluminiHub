const User = require('../models/User');
const College = require('../models/College');

const superAdminController = {
  async getDashboardStats(req, res) {
    try {
      const [totalColleges, totalUsers, pendingColleges, pendingUsers] = await Promise.all([
        College.countDocuments(),
        User.countDocuments({ role: { $ne: 'super_admin' } }),
        College.countDocuments({ status: 'pending' }),
        User.countDocuments({ approvalStatus: 'pending' })
      ]);

      res.json({
        success: true,
        stats: {
          totalColleges,
          totalUsers,
          pendingColleges,
          pendingUsers
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
  }
};

module.exports = superAdminController;