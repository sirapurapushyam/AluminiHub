const Content = require('../models/Content');
const { getPaginationParams } = require('../utils/helpers');

const contentController = {
  // Create content
  async createContent(req, res) {
    try {
      const { title, description, type, eventDate, eventLocation, targetRoles } = req.body;

      const content = new Content({
        title,
        description,
        type,
        eventDate,
        eventLocation,
        targetRoles: targetRoles || ['student', 'alumni', 'faculty'],
        collegeCode: req.user.collegeCode,
        college: req.user.college._id,
        author: req.user._id
      });

      await content.save();
      await content.populate('author', 'firstName lastName');

      res.status(201).json({ 
        success: true,
        message: 'Content created successfully',
        content 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create content' });
    }
  },

  // Get content for college
  async getContent(req, res) {
    try {
      const { type, page = 1, limit = 10 } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);
      
      const query = {
        collegeCode: req.params.collegeCode.toUpperCase(),
        isActive: true,
        targetRoles: { $in: [req.user.role, 'all'] }
      };

      if (type && type !== 'all') {
        query.type = type;
      }

      const content = await Content.find(query)
        .populate('author', 'firstName lastName')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await Content.countDocuments(query);

      res.json({ 
        success: true,
        content, 
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
  },

  // Get single content
  async getSingleContent(req, res) {
    try {
      const content = await Content.findById(req.params.contentId)
        .populate('author', 'firstName lastName email')
        .populate('college', 'name uniqueCode');

      if (!content) {
        return res.status(404).json({ success: false, message: 'Content not found' });
      }

      // Check if user from same college
      if (req.user.collegeCode !== content.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({ success: true, content });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
  },

  // Update content
  async updateContent(req, res) {
    try {
      const { contentId } = req.params;
      const updates = req.body;

      const content = await Content.findById(contentId);

      if (content && req.user.role !== 'college_admin' && content.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      
      if (!content) {
        return res.status(404).json({ success: false, message: 'Content not found or unauthorized' });
      }

      Object.assign(content, updates);
      await content.save();

      res.json({ 
        success: true,
        message: 'Content updated successfully',
        content 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update content' });
    }
  },

  // Delete content
  async deleteContent(req, res) {
    try {
      const { contentId } = req.params;

      const content = await Content.findById(contentId);

      if (content && req.user.role !== 'college_admin' && content.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (!content) {
        return res.status(404).json({ success: false, message: 'Content not found or unauthorized' });
      }

      content.isActive = false;
      await content.save();

      res.json({ 
        success: true,
        message: 'Content deleted successfully' 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to delete content' });
    }
  },

  // Get my content
  async getMyContent(req, res) {
    try {
      const { type, page = 1, limit = 10 } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);
      
      const query = {
        author: req.user._id,
        isActive: true
      };

      if (type && type !== 'all') {
        query.type = type;
      }

      const content = await Content.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await Content.countDocuments(query);

      res.json({ 
        success: true,
        content, 
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
  }
};

module.exports = contentController;