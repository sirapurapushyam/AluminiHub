import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Users, Calendar, Briefcase, Heart, LifeBuoy,
  UserCheck, TrendingUp, AlertCircle, Clock, Shield
} from 'lucide-react'
import StatsCard from '../common/StatsCard'
import LoadingSpinner from '../common/LoadingSpinner'
import api from '../../services/api'

const CollegeAdminDashboard = ({ user }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['collegeAdminStats'],
    queryFn: async () => {
      const response = await api.get('/college-admin/dashboard/stats')
      return response.data.stats
    },
    refetchInterval: 30000
  })

  const { data: pendingUsers } = useQuery({
    queryKey: ['pendingUsers', user.collegeCode],
    queryFn: async () => {
      const response = await api.get(`/users/pending/${user.collegeCode}`)
      return response.data.users
    }
  })

  if (isLoading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">College Admin Dashboard</h1>
        </div>
        <p className="text-primary-100">
          Manage your college community and monitor platform activity
        </p>
      </div>

      {/* College Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-6">
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={`${stats?.newUsersThisMonth || 0} this month`}
          trend={stats?.newUsersThisMonth > 0 ? 'up' : null}
          color="blue"
        />
        <StatsCard
          icon={Calendar}
          label="Active Events"
          value={stats?.activeEvents || 0}
          color="green"
        />
        <StatsCard
          icon={Briefcase}
          label="Job Postings"
          value={stats?.totalJobs || 0}
          color="purple"
        />
        <StatsCard
          icon={Heart}
          label="Total Donations"
          value={`₹${(stats?.totalDonations || 0).toLocaleString()}`}
          color="red"
        />
        <StatsCard
          icon={LifeBuoy}
          label="Open Queries"
          value={stats?.openQueries || 0}
          color="orange"
        />
      </div>

      {/* Pending Approvals */}
      {pendingUsers?.length > 0 && (
        <section className="card border-2 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Pending User Approvals
                </h3>
                <p className="text-orange-700">
                  {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} waiting for approval
                </p>
              </div>
            </div>
            <Link 
              to="/admin/users?tab=pending" 
              className="btn-primary bg-orange-600 hover:bg-orange-700"
            >
              Review Now
            </Link>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            to="/admin/users" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Approve & manage users
                </p>
                {pendingUsers?.length > 0 && (
                  <span className="inline-flex items-center mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {pendingUsers.length} pending
                  </span>
                )}
              </div>
            </div>
          </Link>

          <Link 
            to="/events/create" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Create Event</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Organize college events
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/admin/analytics" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View detailed stats
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/support" 
            className="card hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Support Queries</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Respond to tickets
                </p>
                {stats?.openQueries > 0 && (
                  <span className="inline-flex items-center mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {stats.openQueries} open
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <section className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Registrations</h3>
          {stats?.recentRegistrations?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentRegistrations.map(regUser => (
                <div 
                  key={regUser._id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={regUser.profileImage || `https://ui-avatars.com/api/?name=${regUser.firstName}+${regUser.lastName}&background=random`}
                      alt={regUser.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">
                        {regUser.firstName} {regUser.lastName}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {regUser.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(regUser.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(regUser.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No recent registrations
            </p>
          )}
        </section>

        {/* User Distribution */}
        <section className="card">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">Students</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">
                  {stats?.userBreakdown?.students || 0}
                </span>
                <span className="text-sm text-gray-500">
                  ({Math.round((stats?.userBreakdown?.students / stats?.totalUsers) * 100) || 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Alumni</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">
                  {stats?.userBreakdown?.alumni || 0}
                </span>
                <span className="text-sm text-gray-500">
                  ({Math.round((stats?.userBreakdown?.alumni / stats?.totalUsers) * 100) || 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-900">Faculty</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-600">
                  {stats?.userBreakdown?.faculty || 0}
                </span>
                <span className="text-sm text-gray-500">
                  ({Math.round((stats?.userBreakdown?.faculty / stats?.totalUsers) * 100) || 0}%)
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CollegeAdminDashboard