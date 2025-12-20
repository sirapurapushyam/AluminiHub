import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user is approved
  if (user?.approvalStatus !== 'approved' && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-soft p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your account is currently under review. You'll receive an email once your account has been approved.
          </p>
          {user?.approvalStatus === 'rejected' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Your account was rejected.</p>
              {user.rejectionReason && (
                <p className="text-sm mt-1">Reason: {user.rejectionReason}</p>
              )}
            </div>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }}
            className="btn-secondary"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute