import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Only redirect to login if it's a 401 and NOT a login attempt
    if (error.response?.status === 401) {
      const isLoginAttempt = error.config?.url?.includes('/auth/login')
      const isRegisterAttempt = error.config?.url?.includes('/auth/register')
      
      // Don't redirect if this is a login or register attempt
      // Let the component handle the error
      if (!isLoginAttempt && !isRegisterAttempt) {
        // This is a genuine auth failure (expired token, etc.)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      }
    }
    
    // Always reject the error so components can handle it
    return Promise.reject(error)
  }
)

export default api