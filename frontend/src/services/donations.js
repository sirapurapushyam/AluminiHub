// src/services/donationService.js
import api from './api'

const donationService = {
  /**
   * Get all donations for the college (admin)
   */
  getCollegeDonations: async (collegeCode, params = {}) => {
    try {
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== 'all' && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})

      const response = await api.get(`/donations/college/${collegeCode}`, { params: cleanParams })
      return response.data
    } catch (error) {
      console.error('Error fetching college donations:', error)
      throw error
    }
  },

  /**
   * Get donations made by the current user
   */
  getMyDonations: async (params = {}) => {
    try {
      const response = await api.get('/donations/my-donations', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching my donations:', error)
      throw error
    }
  },

  /**
   * Create a new donation record
   */
  createDonation: async (donationData) => {
    try {
      const response = await api.post('/donations', donationData)
      return response.data
    } catch (error) {
      console.error('Error creating donation:', error)
      throw error
    }
  },

  /**
   * Update a donation's status (admin)
   */
  updateDonationStatus: async (donationId, statusData) => {
    try {
      const payload = {
        status: statusData.status
      }
      
      if (statusData.reason && statusData.reason.trim()) {
        payload.reason = statusData.reason.trim()
      }

      console.log('Calling PUT /donations/' + donationId + '/status with:', payload)
      
      const response = await api.put(`/donations/${donationId}/status`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating donation status:', error.response || error)
      throw error
    }
  },

  /**
   * Get donation statistics (admin)
   */
  getDonationStats: async (collegeCode) => {
    try {
      const response = await api.get(`/donations/stats/${collegeCode}`)
      return response.data
    } catch (error) {
      console.error('Error fetching donation stats:', error)
      throw error
    }
  },

  /**
   * Get donation receipt
   */
  getReceipt: async (donationId) => {
    try {
      const response = await api.get(`/donations/${donationId}/receipt`)
      return response.data
    } catch (error) {
      console.error('Error fetching receipt:', error)
      throw error
    }
  }
}

export default donationService