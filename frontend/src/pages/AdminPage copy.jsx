import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  Users, Shield, TrendingUp, FileText, 
  CheckCircle, XCircle, Clock 
} from 'lucide-react'
import Layout from '../components/common/Layout'
import AdminUsers from '../components/admin/AdminUsers'
import AdminColleges from '../components/admin/AdminColleges'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import { useAuth } from '../context/AuthContext'

const AdminPage = () => {
  const location = useLocation()
  const { isSuperAdmin } = useAuth()

  const tabs = [
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    ...(isSuperAdmin ? [{ path: '/admin/colleges', label: 'Colleges', icon: Shield }] : []),
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>

        {/* Tab Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const isActive = location.pathname === tab.path
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 transition-colors ${
                    isActive 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <Routes>
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          {isSuperAdmin && <Route path="colleges" element={<AdminColleges />} />}
          <Route path="*" element={<AdminUsers />} />
        </Routes>
      </div>
    </Layout>
  )
}

export default AdminPage