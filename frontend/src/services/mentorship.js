// services/mentorship.js
import api from './api'

export const mentorshipService = {
  /**
   * Get mentor recommendations for current user
   */
  getMentorRecommendations: async () => {
    const response = await api.get('/mentorship/mentors/recommendations')
    return response.data
  },

  /**
   * Get available mentors with filtering
   */
  getAvailableMentors: async (params = {}) => {
    const response = await api.get('/mentorship/mentors', { params })
    return response.data
  },

  /**
   * Request mentorship from a mentor
   */
  requestMentorship: async (requestData) => {
    const response = await api.post('/mentorship/request', requestData)
    return response.data
  },

  /**
   * Get mentorship requests received by the current user (as a mentor)
   */
  getMentorshipRequests: async (params = {}) => {
    const response = await api.get('/mentorship/requests', { params })
    return response.data
  },

  /**
   * Get mentorships for the current user (as a mentee)
   */
  getMyMentorships: async (params = {}) => {
    const response = await api.get('/mentorship/my-mentorships', { params })
    return response.data
  },

  /**
   * Respond to a mentorship request
   */
  respondToRequest: async (requestId, responseData) => {
    const response = await api.put(`/mentorship/requests/${requestId}/respond`, responseData)
    return response.data
  },

  /**
   * Add a mentorship session
   */
  addSession: async (mentorshipId, sessionData) => {
    const response = await api.post(`/mentorship/${mentorshipId}/sessions`, sessionData)
    return response.data
  },

  /**
   * Complete a mentorship
   */
  completeMentorship: async (mentorshipId) => {
    const response = await api.put(`/mentorship/${mentorshipId}/complete`)
    return response.data
  },

  /**
   * Add feedback for a completed mentorship
   */
  addFeedback: async (mentorshipId, feedbackData) => {
    const response = await api.post(`/mentorship/${mentorshipId}/feedback`, feedbackData)
    return response.data
  }
}