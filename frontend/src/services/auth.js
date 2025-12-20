import api from './api'

export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Register College
  registerCollege: async (collegeData) => {
    const response = await api.post('/auth/register-college', collegeData)
    return response.data
  },

  // Verify College Code
  verifyCollegeCode: async (code) => {
    const response = await api.get(`/auth/verify-college/${code}`)
    return response.data
  },

  // Google OAuth - Verify College
  googleVerifyCollege: async (collegeCode) => {
    const response = await api.post('/auth/google/verify-college', { collegeCode })
    return response.data
  },

  // Google OAuth - Complete Registration
  googleComplete: async (userData) => {
    const response = await api.post('/auth/google/complete', userData)
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Forgot Password
  forgotPassword: async (email, collegeCode) => {
    const response = await api.post('/auth/forgot-password', { email, collegeCode })
    return response.data
  },

  // Reset Password
  resetPassword: async (token, email, password) => {
    const response = await api.post('/auth/reset-password', { token, email, password })
    return response.data
  },

  // Verify Token
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token')
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },
}