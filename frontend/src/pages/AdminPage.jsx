import React from 'react'
import Layout from '../components/common/Layout'
import AdminColleges from '../components/admin/AdminColleges'
import AdminUsers from '../components/admin/AdminUsers'
import { useAuth } from '../context/AuthContext'

const AdminPage = () => {
  const { isSuperAdmin } = useAuth()

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {isSuperAdmin ? 'Super Admin Dashboard' : 'College Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? 'Manage colleges and platform-wide settings'
              : 'Manage users for your college'}
          </p>
        </div>

        {/* Conditional Page Display */}
        <div>
          {isSuperAdmin ? <AdminColleges /> : <AdminUsers />}
        </div>
      </div>
    </Layout>
  )
}

export default AdminPage
