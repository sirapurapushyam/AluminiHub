// controllers/mentorshipController.js
const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { getPaginationParams } = require('../utils/helpers');
const axios = require('axios');

const mentorshipController = {
  // Get mentor recommendations for current user
  async getMentorRecommendations(req, res) {
    try {
      const userId = req.user._id;
      
      // Get recommendations from Python service
      const pythonURL = `http://localhost:8001/recommend?studentId=${userId}`;
      const { data } = await axios.get(pythonURL);
      
      // Extract mentor IDs from recommendations
      const sameCollegeMentorIds = data.sameCollege.map(mentor => mentor.id);
      const otherCollegeMentorIds = data.otherCollege.map(mentor => mentor.id);
      const allMentorIds = [...sameCollegeMentorIds, ...otherCollegeMentorIds];
      
      if (allMentorIds.length === 0) {
        return res.json({
          success: true,
          mentors: [],
          sameCollege: [],
          otherCollege: [],
          total: 0
        });
      }
      
      // Get full mentor details from database
      const mentors = await User.find({
        _id: { $in: allMentorIds },
        role: { $in: ['alumni', 'faculty'] },
        approvalStatus: 'approved'
      }).populate('college', 'name code')
        .select('firstName lastName email profileImage designation company profile role collegeCode');
      
      // Create a map for quick lookup
      const mentorMap = {};
      mentors.forEach(mentor => {
        mentorMap[mentor._id.toString()] = mentor.toObject();
      });
      
      // Get mentorship stats for each mentor
      const mentorshipStats = await Mentorship.aggregate([
        { $match: { mentor: { $in: allMentorIds } } },
        { $group: {
          _id: '$mentor',
          totalMentorships: { $sum: 1 },
          activeMentorships: {
            $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
          },
          avgRating: { $avg: '$feedback.fromMentee.rating' }
        }}
      ]);

      const statsMap = {};
      mentorshipStats.forEach(stat => {
        statsMap[stat._id.toString()] = stat;
      });
      
      // Add mentor details to same college recommendations and preserve scores
      const sameCollegeWithDetails = data.sameCollege
        .map(rec => {
          const mentor = mentorMap[rec.id];
          if (!mentor) return null;
          
          return {
            ...mentor,
            recommendationScore: rec.score,
            matchingSkills: rec.skills,
            matchingInterests: rec.interests,
            mentorshipStats: statsMap[rec.id] || {
              totalMentorships: 0,
              activeMentorships: 0,
              avgRating: null
            }
          };
        })
        .filter(mentor => mentor !== null);
      
      // Add mentor details to other college recommendations and preserve scores
      const otherCollegeWithDetails = data.otherCollege
        .map(rec => {
          const mentor = mentorMap[rec.id];
          if (!mentor) return null;
          
          return {
            ...mentor,
            recommendationScore: rec.score,
            matchingSkills: rec.skills,
            matchingInterests: rec.interests,
            mentorshipStats: statsMap[rec.id] || {
              totalMentorships: 0,
              activeMentorships: 0,
              avgRating: null
            }
          };
        })
        .filter(mentor => mentor !== null);
      
      const allMentorsWithDetails = [...sameCollegeWithDetails, ...otherCollegeWithDetails];
      
      res.json({
        success: true,
        mentors: allMentorsWithDetails,
        sameCollege: sameCollegeWithDetails,
        otherCollege: otherCollegeWithDetails,
        total: allMentorsWithDetails.length
      });
      
    } catch (error) {
      console.error('Error getting mentor recommendations:', error);
      
      // If Python service is down, fall back to regular mentors from same college
      try {
        const fallbackMentors = await User.find({
          collegeCode: req.user.collegeCode,
          role: { $in: ['alumni', 'faculty'] },
          approvalStatus: 'approved',
          _id: { $ne: req.user._id }
        }).populate('college', 'name code')
          .select('firstName lastName email profileImage designation company profile role collegeCode')
          .limit(10)
          .sort({ 'profile.graduationYear': -1 });

        res.json({
          success: true,
          mentors: fallbackMentors,
          sameCollege: fallbackMentors,
          otherCollege: [],
          total: fallbackMentors.length,
          fallback: true,
          message: 'Showing mentors from your college (recommendation service unavailable)'
        });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        res.status(500).json({
          success: false,
          message: 'Failed to get mentor recommendations',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  },

  // Request mentorship
  async requestMentorship(req, res) {
    try {
      const { mentorId, area, description, goals, requestMessage } = req.body;

      console.log('Mentorship request received:', {
        mentorId,
        area,
        description,
        goalsLength: goals?.length,
        requestMessage: requestMessage?.substring(0, 50) + '...',
        userId: req.user._id,
        userCollege: req.user.college
      });

      // Check if mentor exists
      const mentor = await User.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ success: false, message: 'Mentor not found' });
      }

      // Check if mentor is alumni or faculty
      if (!['alumni', 'faculty'].includes(mentor.role)) {
        return res.status(400).json({
          success: false,
          message: 'Selected user cannot be a mentor'
        });
      }

      // Check for existing mentorship
      const existing = await Mentorship.findOne({
        mentor: mentorId,
        mentee: req.user._id,
        status: { $in: ['pending', 'accepted', 'ongoing'] }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You already have an active mentorship request with this mentor'
        });
      }

      // Ensure college._id exists
      const collegeId = req.user.college?._id || req.user.college;
      if (!collegeId) {
        console.error('College ID missing for user:', req.user._id);
        return res.status(400).json({
          success: false,
          message: 'User college information is missing'
        });
      }

      const mentorship = new Mentorship({
        mentor: mentorId,
        mentee: req.user._id,
        collegeCode: req.user.collegeCode,
        college: collegeId,
        area,
        description,
        goals: goals || [],
        requestMessage
      });

      await mentorship.save();

      // Populate mentor and mentee details
      await mentorship.populate([
        { path: 'mentor', select: 'firstName lastName email' },
        { path: 'mentee', select: 'firstName lastName email' }
      ]);

      // Send email to mentor (don't fail if email fails)
      if (emailService && emailService.sendMentorshipRequestEmail) {
        emailService.sendMentorshipRequestEmail(mentor, req.user, mentorship)
          .catch(err => console.error('Failed to send mentorship email:', err));
      }

      res.status(201).json({
        success: true,
        message: 'Mentorship request sent successfully',
        mentorship
      });
    } catch (error) {
      console.error('Error in requestMentorship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send mentorship request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get mentorship requests (for mentor)
  async getMentorshipRequests(req, res) {
    try {
      const { status = 'pending', page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const query = {
        mentor: req.user._id
      };

      if (status && status !== 'all') {
        query.status = status;
      }

      const requests = await Mentorship.find(query)
        .populate('mentee', 'firstName lastName email profile profileImage')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await Mentorship.countDocuments(query);

      res.json({
        success: true,
        requests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch mentorship requests' });
    }
  },

  // Get my mentorships (as mentee)
  async getMyMentorships(req, res) {
    try {
      const { status, page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const query = {
        mentee: req.user._id
      };

      if (status && status !== 'all') {
        query.status = status;
      }

      const mentorships = await Mentorship.find(query)
        .populate('mentor', 'firstName lastName email profile profileImage')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      const total = await Mentorship.countDocuments(query);

      res.json({
        success: true,
        mentorships,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch mentorships' });
    }
  },

  // Respond to mentorship request
  async respondToRequest(req, res) {
    try {
      const { status, responseMessage } = req.body;
      
      const mentorship = await Mentorship.findOne({
        _id: req.params.requestId,
        mentor: req.user._id,
        status: 'pending'
      }).populate('mentee', 'firstName lastName email');

      if (!mentorship) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      mentorship.status = status;
      mentorship.responseMessage = responseMessage;

      if (status === 'accepted') {
        mentorship.status = 'ongoing';
        mentorship.startDate = new Date();
      }

      await mentorship.save();

      res.json({
        success: true,
        message: `Mentorship request ${status}`,
        mentorship
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to respond to request' });
    }
  },

  // Add session
  async addSession(req, res) {
    try {
      const { date, duration, mode, notes } = req.body;

      const mentorship = await Mentorship.findOne({
        _id: req.params.mentorshipId,
        $or: [
          { mentor: req.user._id },
          { mentee: req.user._id }
        ],
        status: 'ongoing'
      });

      if (!mentorship) {
        return res.status(404).json({ success: false, message: 'Mentorship not found' });
      }

      mentorship.sessions.push({
        date,
        duration,
        mode,
        notes
      });

      await mentorship.save();

      res.json({
        success: true,
        message: 'Session added successfully',
        mentorship
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to add session' });
    }
  },

  // Complete mentorship
  async completeMentorship(req, res) {
    try {
      const mentorship = await Mentorship.findOne({
        _id: req.params.mentorshipId,
        $or: [
          { mentor: req.user._id },
          { mentee: req.user._id }
        ],
        status: 'ongoing'
      });

      if (!mentorship) {
        return res.status(404).json({ success: false, message: 'Mentorship not found' });
      }

      mentorship.status = 'completed';
      mentorship.endDate = new Date();
      await mentorship.save();

      res.json({
        success: true,
        message: 'Mentorship marked as completed'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to complete mentorship' });
    }
  },

  // Add feedback
  async addFeedback(req, res) {
    try {
      const { rating, comment } = req.body;

      const mentorship = await Mentorship.findOne({
        _id: req.params.mentorshipId,
        $or: [
          { mentor: req.user._id },
          { mentee: req.user._id }
        ],
        status: 'completed'
      });

      if (!mentorship) {
        return res.status(404).json({ success: false, message: 'Mentorship not found or not completed' });
      }

      const feedbackType = mentorship.mentor.toString() === req.user._id.toString() 
        ? 'fromMentor' 
        : 'fromMentee';

      mentorship.feedback[feedbackType] = {
        rating,
        comment
      };

      await mentorship.save();

      res.json({
        success: true,
        message: 'Feedback added successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to add feedback' });
    }
  },

  // Get available mentors
  async getAvailableMentors(req, res) {
    try {
      const { area, search, page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const query = {
        collegeCode: req.user.collegeCode,
        role: { $in: ['alumni', 'faculty'] },
        approvalStatus: 'approved',
        _id: { $ne: req.user._id }
      };

      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { 'profile.designation': { $regex: search, $options: 'i' } },
          { 'profile.company': { $regex: search, $options: 'i' } }
        ];
      }

      const mentors = await User.find(query)
        .select('firstName lastName email profile role profileImage collegeCode')
        .populate('college', 'name code')
        .skip(skip)
        .limit(limitNum)
        .sort({ 'profile.graduationYear': -1 });

      // Get mentorship stats for each mentor
      const mentorIds = mentors.map(m => m._id);
      const mentorshipStats = await Mentorship.aggregate([
        { $match: { mentor: { $in: mentorIds } } },
        { $group: {
          _id: '$mentor',
          totalMentorships: { $sum: 1 },
          activeMentorships: {
            $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
          },
          avgRating: { $avg: '$feedback.fromMentee.rating' }
        }}
      ]);

      const statsMap = {};
      mentorshipStats.forEach(stat => {
        statsMap[stat._id.toString()] = stat;
      });

      const mentorsWithStats = mentors.map(mentor => ({
        ...mentor.toObject(),
        mentorshipStats: statsMap[mentor._id.toString()] || {
          totalMentorships: 0,
          activeMentorships: 0,
          avgRating: null
        }
      }));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        mentors: mentorsWithStats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch mentors' });
    }
  }
};

module.exports = mentorshipController;