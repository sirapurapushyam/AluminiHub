const transporter = require('../config/email');
const path = require('path');

class EmailService {
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user, college) {
    const subject = `Welcome to ${college.name} Alumni Connect`;
    const html = `
      <h2>Welcome ${user.firstName} ${user.lastName}!</h2>
      <p>Your registration for ${college.name} Alumni Connect has been approved.</p>
      <p>You can now login and access all features of the platform.</p>
      <p>College Code: <strong>${user.collegeCode}</strong></p>
      <br>
      <p>Best regards,<br>${college.name} Alumni Team</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(user, resetUrl) {
    const subject = 'Password Reset Request - Alumni Connect';
    const html = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.firstName},</p>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy and paste this link: ${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Alumni Connect Team</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendEventRegistrationEmail(user, event) {
    const subject = `Event Registration Confirmation - ${event.title}`;
    const html = `
      <h2>Event Registration Successful</h2>
      <p>Hi ${user.firstName},</p>
      <p>You have successfully registered for the following event:</p>
      <h3>${event.title}</h3>
      <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Venue:</strong> ${event.venue || 'TBA'}</p>
      <p>We look forward to seeing you there!</p>
      <br>
      <p>Best regards,<br>Event Management Team</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendMentorshipRequestEmail(mentor, mentee, request) {
    const subject = 'New Mentorship Request - Alumni Connect';
    const html = `
      <h2>New Mentorship Request</h2>
      <p>Hi ${mentor.firstName},</p>
      <p>You have received a new mentorship request from ${mentee.firstName} ${mentee.lastName}.</p>
      <p><strong>Area:</strong> ${request.area}</p>
      <p><strong>Message:</strong> ${request.requestMessage}</p>
      <p>Please login to your account to respond to this request.</p>
      <br>
      <p>Best regards,<br>Alumni Connect Team</p>
    `;

    return this.sendEmail(mentor.email, subject, html);
  }

  async sendJobApplicationEmail(jobPoster, applicant, job) {
    const subject = `New Application - ${job.title}`;
    const html = `
      <h2>New Job Application</h2>
      <p>Hi ${jobPoster.firstName},</p>
      <p>You have received a new application for your job posting:</p>
      <h3>${job.title}</h3>
      <p><strong>Applicant:</strong> ${applicant.firstName} ${applicant.lastName}</p>
      <p><strong>Email:</strong> ${applicant.email}</p>
      <p>Please login to view the complete application.</p>
      <br>
      <p>Best regards,<br>Alumni Connect Team</p>
    `;

    return this.sendEmail(jobPoster.email, subject, html);
  }
}

module.exports = new EmailService();