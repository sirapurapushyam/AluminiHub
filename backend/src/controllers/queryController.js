const Query = require('../models/Query');
const { getPaginationParams } = require('../utils/helpers');

const queryController = {
  // Create a new query
  async createQuery(req, res) {
    try {
      const { subject, description, category } = req.body;

      const query = new Query({
        subject,
        description,
        category,
        user: req.user._id,
        userRole: req.user.role,
        collegeCode: req.user.collegeCode,
        college: req.user.college
      });

      await query.save();
      await query.populate('user', 'firstName lastName email role');
      
      res.status(201).json({
        success: true,
        message: 'Query submitted successfully',
        query
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to submit query' });
    }
  },

  // Get queries based on user role
  async getQueries(req, res) {
    try {
      const { status, category, page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const queryFilter = {
        collegeCode: req.user.collegeCode
      };

      // Role-based query filtering
      if (req.user.role === 'faculty') {
        // Faculty can see queries from students and alumni only
        queryFilter.userRole = { $in: ['student', 'alumni'] };
      } else if (req.user.role === 'college_admin') {
        // College admins can see all queries from their college
        // But exclude their own queries
        queryFilter.user = { $ne: req.user._id };
      }

      if (status && status !== 'all') queryFilter.status = status;
      if (category && category !== 'all') queryFilter.category = category;

      const queries = await Query.find(queryFilter)
        .populate('user', 'firstName lastName email role')
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Query.countDocuments(queryFilter);

      res.json({
        success: true,
        queries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch queries' });
    }
  },

  // Get my queries (for any user)
  async getMyQueries(req, res) {
    try {
      const { page, limit, status } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const queryFilter = { user: req.user._id };
      if (status && status !== 'all') queryFilter.status = status;

      const queries = await Query.find(queryFilter)
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await Query.countDocuments(queryFilter);

      res.json({
        success: true,
        queries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch your queries' });
    }
  },

  // Get single query
  async getQuery(req, res) {
    try {
      const { queryId } = req.params;
      const query = await Query.findById(queryId)
        .populate('user', 'firstName lastName email role')
        .populate('assignedTo', 'firstName lastName');

      if (!query) {
        return res.status(404).json({ success: false, message: 'Query not found' });
      }

      // Check permissions
      const canView = 
        query.user._id.toString() === req.user._id.toString() || // Own query
        (req.user.role === 'faculty' && ['student', 'alumni'].includes(query.userRole)) || // Faculty viewing student/alumni
        req.user.role === 'college_admin'; // College admin can view all

      if (!canView) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      res.json({ success: true, query });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch query' });
    }
  },

  // Update a query (for faculty and admin)
  async updateQuery(req, res) {
    try {
      const { queryId } = req.params;
      const { status, priority, assignedTo, resolution } = req.body;

      const query = await Query.findById(queryId)
        .populate('user', 'firstName lastName email role');

      if (!query) {
        return res.status(404).json({ success: false, message: 'Query not found' });
      }

      // Check permissions
      const canUpdate = 
        (req.user.role === 'faculty' && ['student', 'alumni'].includes(query.userRole)) ||
        req.user.role === 'college_admin';

      if (!canUpdate) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this query' });
      }

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (assignedTo !== undefined) query.assignedTo = assignedTo || null;
      if (resolution !== undefined) query.resolution = resolution;

      if (status === 'resolved' || status === 'closed') {
        query.resolvedAt = new Date();
        query.resolvedBy = req.user._id;
      }

      await query.save();
      await query.populate('assignedTo', 'firstName lastName');
      await query.populate('resolvedBy', 'firstName lastName');

      res.json({
        success: true,
        message: 'Query updated successfully',
        query
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update query' });
    }
  },

  // Add comment to query
  async addComment(req, res) {
    try {
      const { queryId } = req.params;
      const { comment } = req.body;

      const query = await Query.findById(queryId);
      if (!query) {
        return res.status(404).json({ success: false, message: 'Query not found' });
      }

      query.comments.push({
        user: req.user._id,
        comment,
        createdAt: new Date()
      });

      await query.save();
      await query.populate('comments.user', 'firstName lastName role');

      res.json({
        success: true,
        message: 'Comment added successfully',
        query
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
  }
};

module.exports = queryController;