import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Building2, Users, Shield, TrendingUp,
  Calendar, AlertCircle, Database, Settings,
  Clock, CheckCircle
} from 'lucide-react'
import StatsCard from '../common/StatsCard'
import LoadingSpinner from '../common/LoadingSpinner'
import api from '../../services/api'

const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const response = await api.get('/super-admin/dashboard/stats')
      return response.data.stats
    },
    refetchInterval: 30000
  })

  const { data: pendingColleges } = useQuery({
    queryKey: ['pendingColleges'],
    queryFn: async () => {
      const response = await api.get('/super-admin/pending-colleges')
      return response.data.colleges
    }
  })

  if (isLoading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        </div>
        <p className="text-gray-300">
          Manage the entire platform and oversee all colleges
        </p>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={Building2}
          label="Total Colleges"
          value={stats?.totalColleges || 0}
          change={`${stats?.approvedColleges || 0} approved`}
          color="blue"
        />
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={`${stats?.activeUsers || 0} active`}
          trend={stats?.activeUsers > 0 ? 'up' : null}
          color="green"
        />
        <StatsCard
          icon={Calendar}
          label="Platform Events"
          value={stats?.totalEvents || 0}
          change="Across all colleges"
          color="purple"
        />
        <StatsCard
          icon={Shield}
          label="College Admins"
          value={stats?.totalAdmins || 0}
          change="Managing colleges"
          color="orange"
        />
      </div>

      {/* Pending Approvals Alert */}
      {stats?.pendingColleges > 0 && (
        <div className="card border-2 border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-amber-900">
                  Pending College Approvals
                </h3>
                <p className="text-amber-700">
                  {stats.pendingColleges} college{stats.pendingColleges > 1 ? 's' : ''} waiting for approval
                </p>
              </div>
            </div>
            <Link 
              to="/admin/colleges?tab=pending" 
              className="btn-primary bg-amber-600 hover:bg-amber-700"
            >
              Review Now
            </Link>
          </div>
        </div>
      )}

      {/* System Management Grid */}
      {/* <section> */}
        {/* <h2 className="text-2xl font-semibold mb-6">College Management</h2> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6"> */}
          {/* <Link 
            to="/admin/colleges" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">College Management</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Approve, reject, or manage colleges
                </p>
                <div className="mt-3 flex justify-center space-x-4 text-xs">
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {stats?.approvedColleges || 0} Approved
                  </span>
                  <span className="flex items-center text-amber-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {stats?.pendingColleges || 0} Pending
                  </span>
                </div>
              </div>
            </div>
          </Link> */}

          {/* <Link 
            to="/admin/platform-analytics" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Platform Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View global statistics and trends
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Real-time platform insights
                </div>
              </div>
            </div>
          </Link> */}

          {/* <Link 
            to="/admin/system-settings" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">System Settings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configure platform settings
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  Manage global configurations
                </div>
              </div>
            </div>
          </Link> */}
        {/* </div> */}
      {/* // </section>  */}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Colleges */}
        <section className="card">
          <h3 className="text-lg font-semibold mb-4">Top Performing Colleges</h3>
          {stats?.topColleges?.length > 0 ? (
            <div className="space-y-3">
              {stats.topColleges.map((college, index) => (
                <div 
                  key={college._id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-primary-500'}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{college.name}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{college.userCount} users</span>
                        <span>•</span>
                        <span>{college.eventCount} events</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">
                      {college.engagementRate}%
                    </span>
                    <p className="text-xs text-gray-500">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No college data available yet
            </p>
          )}
        </section>

        {/* Recent Activity */}
        <section className="card">
          <h3 className="text-lg font-semibold mb-4">Platform Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">New Colleges This Month</p>
                  <p className="text-xs text-gray-600">Recently registered</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.newCollegesThisMonth || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Active Users</p>
                  <p className="text-xs text-gray-600">Last 30 days</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats?.activeUsers || 0}
              </span>
            </div>

            {pendingColleges?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Recent Pending Colleges
                </p>
                {pendingColleges.slice(0, 3).map(college => (
                  <div key={college._id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{college.name}</p>
                      <p className="text-xs text-gray-500">
                        Applied {new Date(college.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/admin/colleges/${college._id}`}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SuperAdminDashboard