import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Users, Calendar, Briefcase, Heart, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import StatsCard from '../common/StatsCard'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const AdminAnalytics = () => {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['collegeStats', user.collegeCode],
    queryFn: async () => {
      const response = await api.get(`/colleges/${user.collegeCode}/stats`)
      return response.data.stats
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const userGrowthData = stats?.userGrowth || []
  const roleDistributionData = [
    { name: 'Students', value: stats?.roleDistribution?.students || 0, color: '#22c55e' },
    { name: 'Alumni', value: stats?.roleDistribution?.alumni || 0, color: '#3b82f6' },
    { name: 'Faculty', value: stats?.roleDistribution?.faculty || 0, color: '#a855f7' }
  ]

  const eventData = stats?.monthlyEvents || []
  const jobData = stats?.jobStats || []

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers || 0}
          change={`+${stats?.newUsersThisMonth || 0} this month`}
          trend="up"
          color="blue"
        />
        <StatsCard
          icon={Calendar}
          label="Total Events"
          value={stats?.totalEvents || 0}
          change={`${stats?.activeEvents || 0} active`}
          color="green"
        />
        <StatsCard
          icon={Briefcase}
          label="Job Postings"
          value={stats?.totalJobs || 0}
          change={`${stats?.activeJobs || 0} active`}
          color="purple"
        />
        <StatsCard
          icon={Heart}
          label="Total Donations"
          value={`₹${(stats?.totalDonations || 0).toLocaleString()}`}
          change={`₹${(stats?.donationsThisMonth || 0).toLocaleString()} this month`}
          trend="up"
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Event Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Event Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#22c55e" />
              <Bar dataKey="attendees" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Job Posting Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Job Posting Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="posted" fill="#a855f7" />
              <Bar dataKey="applications" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {stats?.topContributors?.map((contributor, index) => (
              <div key={contributor._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <img
                    src={contributor.profileImage || `https://ui-avatars.com/api/?name=${contributor.firstName}+${contributor.lastName}`}
                    alt={contributor.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{contributor.firstName} {contributor.lastName}</p>
                    <p className="text-sm text-gray-600">{contributor.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${contributor.totalDonations.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{contributor.donationCount} donations</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'event' ? 'bg-green-500' :
                  activity.type === 'job' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics