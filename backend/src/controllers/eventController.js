const Event = require('../models/Event');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { deleteFile } = require('../services/cloudinaryService');
const { getPaginationParams } = require('../utils/helpers');

const eventController = {
  // Create event
  async createEvent(req, res) {
    try {
      const { 
        title, description, eventDate, eventEndDate, location, venue, 
        eventType, targetAudience, maxAttendees, registrationDeadline 
      } = req.body;

      // Parse targetAudience
      let targetRoles = [];
      if (targetAudience === 'all') {
        targetRoles = ['student', 'alumni', 'faculty'];
      } else if (Array.isArray(targetAudience)) {
        targetRoles = targetAudience;
      } else if (targetAudience) {
        targetRoles = [targetAudience];
      }

      const event = new Event({
        title,
        description,
        eventDate,
        eventEndDate,
        location,
        venue,
        eventType,
        targetRoles,
        maxAttendees: maxAttendees || null,
        registrationDeadline,
        collegeCode: req.user.collegeCode,
        college: req.user.college._id,
        organizer: req.user._id
      });

      if (req.file) {
        event.eventImage = req.file.path; 
        event.eventImagePublicId = req.file.filename; 
      }

      await event.save();
      await event.populate('organizer', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ success: false, message: 'Failed to create event', error: error.message });
    }
  },

  // Get events
  async getEvents(req, res) {
    try {
      const { eventType, upcoming, past, search, page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const query = {
        collegeCode: req.params.collegeCode.toUpperCase(),
        isActive: true
      };

      // Filter by event type
      if (eventType && eventType !== 'all') {
        query.eventType = eventType;
      }

      // Filter by date
      const now = new Date();
      if (upcoming === 'true') {
        query.eventDate = { $gte: now };
      } else if (past === 'true') {
        query.eventDate = { $lt: now };
      }

      // Filter by target role (if not admin)
      if (req.user.role !== 'college_admin') {
        query.$or = [
          { targetRoles: { $in: [req.user.role] } },
          { targetRoles: { $in: ['all'] } }
        ];
      }

      // Search
      if (search) {
        query.$and = [
          ...(query.$and || []),
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { location: { $regex: search, $options: 'i' } }
            ]
          }
        ];
      }

      const events = await Event.find(query)
        .populate('organizer', 'firstName lastName')
        .skip(skip)
        .limit(limitNum)
        .sort({ eventDate: upcoming === 'true' ? 1 : -1 });

      const total = await Event.countDocuments(query);

      // Add registration status per event
      const eventsWithStatus = events.map(event => {
        const eventObj = event.toObject();
        eventObj.isRegistered = event.attendees.some(
          a => a.user.toString() === req.user._id.toString() && a.status !== 'cancelled'
        );
        return eventObj;
      });

      res.json({
        success: true,
        events: eventsWithStatus,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch events' });
    }
  },

  // Get single event
  async getEvent(req, res) {
    try {
      const event = await Event.findById(req.params.eventId)
        .populate('organizer', 'firstName lastName email profileImage')
        .populate('attendees.user', 'firstName lastName email profileImage');

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      if (req.user.collegeCode !== event.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const isRegistered = event.attendees.some(
        a => a.user._id.toString() === req.user._id.toString() && a.status !== 'cancelled'
      );

      const eventObj = event.toObject();
      eventObj.isRegistered = isRegistered;
      eventObj.canRegister = event.maxAttendees ? event.availableSeats > 0 : true;

      res.json({
        success: true,
        event: eventObj,
        isRegistered,
        canRegister: event.maxAttendees ? event.availableSeats > 0 : true
      });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch event' });
    }
  },

  // Update event
  async updateEvent(req, res) {
    try {
      const event = await Event.findById(req.params.eventId);

      if (event && req.user.role !== 'college_admin' && event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      }

      const updates = req.body;
      delete updates.collegeCode;
      delete updates.college;
      delete updates.organizer;

      if (req.file) {
        if (event.eventImage) {
          await deleteFile(event.eventImagePublicId);
        }
        updates.eventImage = req.file.path;
        updates.eventImagePublicId = req.file.filename;
      }

      Object.assign(event, updates);
      await event.save();

      res.json({
        success: true,
        message: 'Event updated successfully',
        event
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ success: false, message: 'Failed to update event' });
    }
  },

  // Delete event
  async deleteEvent(req, res) {
    try {
      const event = await Event.findById(req.params.eventId);

      if (event && req.user.role !== 'college_admin' && event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      }

      event.isActive = false;
      await event.save();

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete event' });
    }
  },

  // Register for event
  async registerForEvent(req, res) {
    try {
      const event = await Event.findById(req.params.eventId);
      
      if (!event || !event.isActive) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      if (req.user.collegeCode !== event.collegeCode) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const alreadyRegistered = event.attendees.some(
        a => a.user.toString() === req.user._id.toString()
      );
      if (alreadyRegistered) {
        return res.status(400).json({ success: false, message: 'Already registered for this event' });
      }

      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
      }

      if (event.maxAttendees && event.attendeeCount >= event.maxAttendees) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }

      event.attendees.push({ user: req.user._id });
      await event.save();

      await emailService.sendEventRegistrationEmail(req.user, event);

      res.json({
        success: true,
        message: 'Successfully registered for event'
      });
    } catch (error) {
      console.error('Register event error:', error);
      res.status(500).json({ success: false, message: 'Failed to register for event' });
    }
  },

  // Cancel registration
  async cancelRegistration(req, res) {
    try {
      const event = await Event.findById(req.params.eventId);
      
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      const attendeeIndex = event.attendees.findIndex(
        a => a.user.toString() === req.user._id.toString()
      );

      if (attendeeIndex === -1) {
        return res.status(400).json({ success: false, message: 'Not registered for this event' });
      }

      event.attendees[attendeeIndex].status = 'cancelled';
      await event.save();

      res.json({
        success: true,
        message: 'Registration cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel registration error:', error);
      res.status(500).json({ success: false, message: 'Failed to cancel registration' });
    }
  },

  // Get attendees (with export-friendly data)
  async getAttendees(req, res) {
    try {
      const event = await Event.findById(req.params.eventId)
        .populate('attendees.user', 'firstName lastName email role profile.phone');

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      if (req.user.role !== 'college_admin' && event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const attendees = event.attendees
        .filter(a => a.status !== 'cancelled')
        .map(a => ({
          _id: a.user._id,
          firstName: a.user.firstName,
          lastName: a.user.lastName,
          email: a.user.email,
          role: a.user.role,
          phone: a.user.profile?.phone,
          registeredAt: a.registeredAt,
          status: a.status
        }));

      res.json({
        success: true,
        attendees,
        total: attendees.length,
        event: {
          title: event.title,
          date: event.eventDate
        }
      });
    } catch (error) {
      console.error('Get attendees error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendees' });
    }
  },

  // Mark attendance
  async markAttendance(req, res) {
    try {
      const { attendees } = req.body;
      const event = await Event.findById(req.params.eventId);

      if (event && req.user.role !== 'college_admin' && event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
      }

      for (const userId of attendees) {
        const attendee = event.attendees.find(
          a => a.user.toString() === userId && a.status === 'registered'
        );
        if (attendee) {
          attendee.status = 'attended';
        }
      }

      await event.save();

      res.json({
        success: true,
        message: 'Attendance marked successfully'
      });
    } catch (error) {
      console.error('Mark attendance error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
  }
};

module.exports = eventController;
