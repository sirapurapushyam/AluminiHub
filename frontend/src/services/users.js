import api from './api'

export const userService = {
  // Get Pending Users
  getPendingUsers: async (collegeCode) => {
    const response = await api.get(`/users/pending/${collegeCode}`)
    return response.data
  },

  // Approve/Reject User
  approveUser: async (userId, status, rejectionReason = '') => {
    const response = await api.put(`/users/approval/${userId}`, { status, rejectionReason })
    return response.data
  },

  // Get College Users
  getCollegeUsers: async (collegeCode, params = {}) => {
    const response = await api.get(`/users/college/${collegeCode}`, { params })
    return response.data
  },

  // Get User Profile
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/profile/${userId || ''}`)
    return response.data
  },

  // Update Profile
  updateProfile: async (formData) => {
    const response = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', { currentPassword, newPassword })
    return response.data
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/users/me')
    return response.data
  },
   generateResumeViewUrl: (resumeUrl) => {
    if (!resumeUrl) return null
    // Ensure URL opens for viewing, not downloading
    return resumeUrl.includes('?') 
      ? resumeUrl 
      : `${resumeUrl}?disposition=inline`
  },
   generateResumeDownloadUrl: (resumeUrl, filename) => {
    if (!resumeUrl) return null
    // Force download with proper filename
    const encodedFilename = encodeURIComponent(filename || 'resume.pdf')
    return resumeUrl.includes('?') 
      ? `${resumeUrl}&fl_attachment=${encodedFilename}`
      : `${resumeUrl}?fl_attachment=${encodedFilename}`
  },

  // Validate resume file before upload
  validateResumeFile: (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, DOC, and DOCX files are allowed')
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }
    
    return true
  }
}