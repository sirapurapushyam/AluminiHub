// src/services/eventService.js
import api from './api'

const eventService = {
  // Create Event
  createEvent: async (formData) => {
    try {
      const response = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      console.error('Create event error:', error)
      throw error
    }
  },

  // Get College Events
  getCollegeEvents: async (collegeCode, params = {}) => {
    try {
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})

      const response = await api.get(`/events/college/${collegeCode}`, { params: cleanParams })
      return response.data
    } catch (error) {
      console.error('Get events error:', error)
      throw error
    }
  },

  // Get Event Details
  getEventDetails: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Get event details error:', error)
      throw error
    }
  },

  // Update Event
  updateEvent: async (eventId, formData) => {
    try {
      const response = await api.put(`/events/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error) {
      console.error('Update event error:', error)
      throw error
    }
  },

  // Delete Event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}`)
      return response.data
    } catch (error) {
      console.error('Delete event error:', error)
      throw error
    }
  },

  // Register for Event
  registerForEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`)
      return response.data
    } catch (error) {
      console.error('Register event error:', error)
      throw error
    }
  },

  // Cancel Registration
  cancelRegistration: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/cancel`)
      return response.data
    } catch (error) {
      console.error('Cancel registration error:', error)
      throw error
    }
  },

  // Get Attendees
  getAttendees: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/attendees`)
      return response.data
    } catch (error) {
      console.error('Get attendees error:', error)
      throw error
    }
  },

  // Mark Attendance
  markAttendance: async (eventId, attendees) => {
    try {
      const response = await api.post(`/events/${eventId}/attendance`, { attendees })
      return response.data
    } catch (error) {
      console.error('Mark attendance error:', error)
      throw error
    }
  },
}

export default eventService