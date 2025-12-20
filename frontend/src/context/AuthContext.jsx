import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user and validate token
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (storedUser && token) {
        try {
          const response = await authService.verifyToken()
          if (response.success) {
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
          } else {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

const login = async (credentials) => {
  try {
    const response = await authService.login(credentials)
    if (response.success) {
      setUser(response.user)
      return response
    }
    throw new Error(response.message || 'Login failed')
  } catch (error) {
    throw error;
  }
}

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      logout,
      isAuthenticated: !!user,
      isStudent: user?.role === 'student',
      isAlumni: user?.role === 'alumni',
      isFaculty: user?.role === 'faculty',
      isCollegeAdmin: user?.role === 'college_admin',
      isSuperAdmin: user?.role === 'super_admin',
      isAdmin: user?.role === 'college_admin' || user?.role === 'super_admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}