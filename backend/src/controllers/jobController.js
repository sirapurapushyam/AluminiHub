// controllers/jobController.js
const Job = require('../models/Job');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const { getPaginationParams } = require('../utils/helpers');

const jobController = {
  // Create job - Simplified
  async createJob(req, res) {
    try {
      // Check if user can post jobs
      if (req.user.role === 'student') {
        return res.status(403).json({ 
          success: false, 
          message: 'Students cannot post jobs' 
        });
      }

      const {
        title,
        company,
        package: packageInfo,
        externalLink,
        description,
        referralAvailable,
        referralCount,
        targetAudience,
        experienceRequired
      } = req.body;

      const job = new Job({
        title,
        company,
        package: packageInfo,
        externalLink,
        description,
        referralAvailable: referralAvailable || false,
        referralCount: referralAvailable ? (referralCount || 0) : 0,
        targetAudience,
        experienceRequired,
        postedBy: req.user._id,
        collegeCode: req.user.collegeCode,
        college: req.user.college._id
      });

      await job.save();
      await job.populate('postedBy', 'firstName lastName profileImage graduationYear');

      // Send notification to all college members
      await notificationService.sendCollegeNotification(
        req.user.collegeCode,
        {
          type: 'job_posted',
          title: 'New Job Opportunity',
          message: `${req.user.firstName} ${req.user.lastName} posted a new job: ${title} at ${company}`,
          data: {
            jobId: job._id,
            postedBy: req.user._id
          }
        }
      );

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        job
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to post job' });
    }
  },

// controllers/jobController.js
  async getJobs(req, res) {
    try {
      const { search, targetAudience, experienceRequired, page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);
      const user = req.user;

      // Base query - simple and direct
      const query = {
        collegeCode: user.collegeCode,
        isActive: true
      };

      // Apply filters if provided
      if (targetAudience && targetAudience !== '') {
        query.targetAudience = targetAudience;
      }

      if (experienceRequired && experienceRequired !== '') {
        query.experienceRequired = experienceRequired;
      }

      // Search
      if (search && search.trim() !== '') {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { package: { $regex: search, $options: 'i' } }
        ];
      }

      console.log('Query being executed:', JSON.stringify(query, null, 2));
      console.log('User collegeCode:', user.collegeCode);

      // First, let's check if there are any jobs at all
      const totalJobsInCollege = await Job.countDocuments({ collegeCode: user.collegeCode });
      console.log('Total jobs in college:', totalJobsInCollege);

      const jobs = await Job.find(query)
        .populate('postedBy', 'firstName lastName profileImage role graduationYear')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(); // Use lean for better performance

      const total = await Job.countDocuments(query);
      console.log(`Found ${jobs.length} jobs out of ${total} total matching the query`);

      // Add user interaction status
      const jobsWithStatus = jobs.map(job => {
        const jobObj = { ...job };
        jobObj.availableReferrals = job.referralCount - job.referralsUsed;
        
        const userInteraction = job.interestedUsers?.find(
          iu => iu.user.toString() === user._id.toString()
        );
        
        jobObj.hasShownInterest = !!userInteraction;
        jobObj.hasRequestedReferral = userInteraction?.requestedReferral || false;
        jobObj.referralGranted = userInteraction?.referralGranted || false;
        jobObj.canManage = job.postedBy._id.toString() === user._id.toString() || 
                          user.role === 'college_admin';
        
        return jobObj;
      });

      res.json({
        success: true,
        jobs: jobsWithStatus,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error in getJobs:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch jobs', 
        error: error.message 
      });
    }
  },

  // Get single job
  async getJob(req, res) {
    try {
      const job = await Job.findById(req.params.jobId)
        .populate('postedBy', 'firstName lastName email profileImage role graduationYear')
        .populate('interestedUsers.user', 'firstName lastName email profileImage');

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (req.user.collegeCode !== job.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      job.views += 1;
      await job.save();

      const userInteraction = job.interestedUsers.find(
        iu => iu.user._id.toString() === req.user._id.toString()
      );

      res.json({
        success: true,
        job: job.toObject(),
        hasShownInterest: !!userInteraction,
        hasRequestedReferral: userInteraction?.requestedReferral || false,
        referralGranted: userInteraction?.referralGranted || false,
        canManage: job.postedBy._id.toString() === req.user._id.toString() || 
                  req.user.role === 'college_admin'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch job' });
    }
  },

  // Show interest in job
  async showInterest(req, res) {
    try {
      const { requestReferral } = req.body;
      const job = await Job.findById(req.params.jobId);

      if (!job || !job.isActive) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      const existingInterest = job.interestedUsers.find(
        iu => iu.user.toString() === req.user._id.toString()
      );

      if (existingInterest) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already shown interest in this job' 
        });
      }

      const interest = {
        user: req.user._id,
        requestedReferral: requestReferral && job.referralAvailable && job.availableReferrals > 0
      };

      job.interestedUsers.push(interest);
      await job.save();

      await notificationService.sendNotification(job.postedBy, {
        type: 'job_interest',
        title: 'New Interest in Your Job Post',
        message: `${req.user.firstName} ${req.user.lastName} is interested in ${job.title} position${interest.requestedReferral ? ' and requested a referral' : ''}`,
        data: {
          jobId: job._id,
          interestedUserId: req.user._id,
          requestedReferral: interest.requestedReferral
        }
      });

      res.json({
        success: true,
        message: 'Interest shown successfully',
        requestedReferral: interest.requestedReferral
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to show interest' });
    }
  },

  // Grant referral
  async grantReferral(req, res) {
    try {
      const { userId } = req.body;
      const job = await Job.findById(req.params.jobId);

      if (!job || job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found or unauthorized' 
        });
      }

      if (!job.referralAvailable || job.availableReferrals <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No referrals available' 
        });
      }

      const interest = job.interestedUsers.find(
        iu => iu.user.toString() === userId && iu.requestedReferral
      );

      if (!interest) {
        return res.status(404).json({ 
          success: false, 
          message: 'User has not requested referral' 
        });
      }

      if (interest.referralGranted) {
        return res.status(400).json({ 
          success: false, 
          message: 'Referral already granted' 
        });
      }

      interest.referralGranted = true;
      job.referralsUsed += 1;
      await job.save();

      const referredUser = await User.findById(userId).select('firstName lastName email');

      await notificationService.sendNotification(userId, {
        type: 'referral_granted',
        title: 'Referral Granted!',
        message: `${req.user.firstName} ${req.user.lastName} has granted you a referral for ${job.title} at ${job.company}`,
        data: {
          jobId: job._id,
          referredBy: req.user._id
        },
        sendEmail: true
      });

      res.json({
        success: true,
        message: 'Referral granted successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to grant referral' });
    }
  },

  // Update job
  async updateJob(req, res) {
    try {
      const job = await Job.findById(req.params.jobId);

      if (!job || (req.user.role !== 'college_admin' && job.postedBy.toString() !== req.user._id.toString())) {
        return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
      }

      const updates = req.body;
      delete updates.postedBy;
      delete updates.collegeCode;
      delete updates.college;

      Object.assign(job, updates);
      await job.save();

      res.json({
        success: true,
        message: 'Job updated successfully',
        job
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update job' });
    }
  },

  // Delete job
  async deleteJob(req, res) {
    try {
      const job = await Job.findById(req.params.jobId);

      if (!job || (req.user.role !== 'college_admin' && job.postedBy.toString() !== req.user._id.toString())) {
        return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
      }

      job.isActive = false;
      await job.save();

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to delete job' });
    }
  },

  // Get interested users
  async getInterestedUsers(req, res) {
    try {
      const job = await Job.findById(req.params.jobId)
        .populate('interestedUsers.user', 'firstName lastName email profileImage graduationYear currentPosition');

      if (!job || job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found or unauthorized' 
        });
      }

      res.json({
        success: true,
        interestedUsers: job.interestedUsers,
        referralStats: {
          total: job.referralCount,
          used: job.referralsUsed,
          available: job.availableReferrals
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch interested users' });
    }
  },

  // Get my posted jobs
  async getMyJobs(req, res) {
    try {
      const { page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const jobs = await Job.find({
        postedBy: req.user._id,
        isActive: true
      })
      .populate('interestedUsers.user', 'firstName lastName')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

      const total = await Job.countDocuments({
        postedBy: req.user._id,
        isActive: true
      });

      res.json({
        success: true,
        jobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
  }
};

module.exports = jobController;