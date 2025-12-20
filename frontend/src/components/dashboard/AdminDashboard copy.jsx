import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Users, Calendar, Briefcase, Heart, LifeBuoy,
  UserCheck, TrendingUp, AlertCircle, 
  Building2, Shield, Database, Settings
} from 'lucide-react'
import StatsCard from '../common/StatsCard'
import LoadingSpinner from '../common/LoadingSpinner'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const AdminDashboard = ({ user }) => {
  const { isSuperAdmin } = useAuth()

  // Super Admin Stats
  const { data: superAdminStats, isLoading: isSuperAdminLoading } = useQuery({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/super/stats')
      return response.data.stats
    },
    enabled: isSuperAdmin
  })

  // College Admin Stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const response = await api.get(`/colleges/${user.collegeCode}/stats`)
      return response.data.stats
    },
    enabled: !isSuperAdmin
  })

  const { data: pendingUsers } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const response = await api.get(`/users/pending/${user.collegeCode}`)
      return response.data.users
    },
    enabled: !isSuperAdmin
  })

  if (isLoading || isSuperAdminLoading) return <LoadingSpinner size="large" />

  // Super Admin Dashboard
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard 🚀</h1>
          <p className="text-gray-300">
            Manage the entire platform and oversee all colleges.
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            icon={Building2}
            label="Total Colleges"
            value={superAdminStats?.totalColleges || 0}
            change={`${superAdminStats?.newCollegesThisMonth || 0} this month`}
            color="blue"
          />
          <StatsCard
            icon={Users}
            label="Total Users"
            value={superAdminStats?.totalUsers || 0}
            change={`${superAdminStats?.activeUsers || 0} active`}
            color="green"
          />
          <StatsCard
            icon={Database}
            label="Total Events"
            value={superAdminStats?.totalEvents || 0}
            color="purple"
          />
          <StatsCard
            icon={Shield}
            label="Active Admins"
            value={superAdminStats?.totalAdmins || 0}
            color="orange"
          />
        </div>

        {/* Quick Actions for Super Admin */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">System Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/admin/colleges" className="card hover:shadow-xl transition-all group">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Manage Colleges</h3>
                <p className="text-sm text-gray-600">Add, edit, or remove colleges</p>
              </div>
            </Link>
            <Link to="/admin/platform-analytics" className="card hover:shadow-xl transition-all group">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Platform Analytics</h3>
                <p className="text-sm text-gray-600">View global statistics</p>
              </div>
            </Link>
            <Link to="/admin/settings" className="card hover:shadow-xl transition-all group">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold">System Settings</h3>
                <p className="text-sm text-gray-600">Configure platform settings</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Top Colleges */}
        <section className="card">
          <h3 className="text-lg font-semibold mb-4">Top Performing Colleges</h3>
          <div className="space-y-3">
            {superAdminStats?.topColleges?.map((college, index) => (
              <div key={college._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-semibold text-primary-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{college.name}</p>
                    <p className="text-sm text-gray-600">{college.userCount} users</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {college.engagementRate}% engagement
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // College Admin Dashboard
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
        <p className="text-red-100">
          Manage your college community and monitor platform activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={`${stats?.newUsersThisMonth || 0} this month`}
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
          color="orange"
        />
        <StatsCard
          icon={LifeBuoy}
          label="Open Tickets"
          value={stats?.openQueries || 0}
          color="red"
        />
      </div>

      {/* Pending Approvals */}
      {pendingUsers?.length > 0 && (
        <section className="card border-2 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900">Pending Approvals</h3>
            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {pendingUsers.length}
            </span>
          </div>
          <p className="text-orange-700 mb-4">
            {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} waiting for approval
          </p>
          <Link to="/admin/users" className="btn-primary bg-orange-600 hover:bg-orange-700">
            Review Now
          </Link>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/users" className="card hover:shadow-xl transition-all group">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-gray-600">Approve & manage users</p>
            </div>
          </Link>
          <Link to="/events/create" className="card hover:shadow-xl transition-all group">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Create Event</h3>
              <p className="text-sm text-gray-600">Organize college events</p>
            </div>
          </Link>
          <Link to="/admin/analytics" className="card hover:shadow-xl transition-all group">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed stats</p>
            </div>
          </Link>
            <Link to="/support" className="card hover:shadow-xl transition-all group">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LifeBuoy className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold">Manage Queries</h3>
                <p className="text-sm text-gray-600">Respond to user tickets</p>
              </div>
            </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.recentRegistrations?.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Registrations</h3>
            <div className="space-y-3">
              {stats.recentRegistrations.map(regUser => (
                <div key={regUser._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={regUser.profileImage || `https://ui-avatars.com/api/?name=${regUser.firstName}+${regUser.lastName}`}
                      alt={regUser.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{regUser.firstName} {regUser.lastName}</p>
                      <p className="text-sm text-gray-600 capitalize">{regUser.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(regUser.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminDashboard