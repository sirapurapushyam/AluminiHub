import api from './api'

export const collegeService = {
  // Get college details
  getCollege: async (collegeCode) => {
    const response = await api.get(`/colleges/${collegeCode}`)
    return response.data
  },

  // Update college
  updateCollege: async (collegeCode, data) => {
    const response = await api.put(`/colleges/${collegeCode}`, data)
    return response.data
  },

  // Get college statistics
  getCollegeStats: async (collegeCode) => {
    const response = await api.get(`/colleges/${collegeCode}/stats`)
    return response.data
  },

  // Get activity feed
  getActivityFeed: async (collegeCode, params = {}) => {
    const response = await api.get(`/colleges/${collegeCode}/activity`, { params })
    return response.data
  }
}