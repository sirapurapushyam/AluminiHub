import React from 'react'
import { useAuth } from '../../context/AuthContext'
import SuperAdminDashboard from './SuperAdminDashboard'
import CollegeAdminDashboard from './CollegeAdminDashboard'

const AdminDashboard = ({ user }) => {
  const { isSuperAdmin } = useAuth()

  // Render appropriate dashboard based on role
  if (isSuperAdmin) {
    return <SuperAdminDashboard />
  }

  return <CollegeAdminDashboard user={user} />
}

export default AdminDashboard