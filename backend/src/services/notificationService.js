const User = require('../models/User');
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  async sendNotification(userId, notification) {
    try {
      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notification', {
          ...notification,
          timestamp: new Date()
        });
      }

      // For important notifications, also send email
      if (notification.type === 'important' || notification.sendEmail) {
        const user = await User.findById(userId);
        if (user && user.notifications.email) {
          await emailService.sendEmail(
            user.email,
            notification.title,
            this.generateEmailHTML(notification)
          );
        }
      }

      console.log(`Notification sent to user ${userId}:`, notification.message);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  generateEmailHTML(notification) {
    return `
      <h2>${notification.title}</h2>
      <p>${notification.message}</p>
      <p><small>Sent via Alumni Connect Platform</small></p>
    `;
  }

  // Bulk notification sender
  async sendBulkNotification(userIds, notification) {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, notification)
    );
    
    try {
      await Promise.all(promises);
      console.log(`Bulk notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
    }
  }

  // College-wide notifications
  async sendCollegeNotification(collegeCode, notification) {
    try {
      const users = await User.find({
        collegeCode,
        approvalStatus: 'approved',
        isActive: true
      }).select('_id');

      const userIds = users.map(u => u._id.toString());
      await this.sendBulkNotification(userIds, notification);

      // Also broadcast via Socket.IO to college room
      if (this.io) {
        this.io.to(collegeCode).emit('college-notification', {
          ...notification,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to send college notification:', error);
    }
  }
}

module.exports = new NotificationService();