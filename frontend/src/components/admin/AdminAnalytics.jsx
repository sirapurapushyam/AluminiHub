import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, Calendar, Briefcase, Heart, 
  TrendingUp, PieChart, BarChart3, Activity 
} from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import StatsCard from '../common/StatsCard'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month')
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['collegeAnalytics', user.collegeCode, timeRange],
    queryFn: async () => {
      const response = await api.get(`/colleges/${user.collegeCode}/analytics?range=${timeRange}`)
      return response.data
    }
  })

  if (isLoading) return <LoadingSpinner size="large" />

  // Chart configurations
  const userDistributionData = {
    labels: ['Students', 'Alumni', 'Faculty'],
    datasets: [{
      label: 'User Distribution',
      data: [
        stats?.userDistribution?.students || 0,
        stats?.userDistribution?.alumni || 0,
        stats?.userDistribution?.faculty || 0
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  }

  const monthlyRegistrationsData = {
    labels: stats?.monthlyRegistrations?.labels || [],
    datasets: [{
      label: 'New Registrations',
      data: stats?.monthlyRegistrations?.data || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  }

  const eventsJobsData = {
    labels: stats?.eventsJobs?.labels || [],
    datasets: [
      {
        label: 'Events',
        data: stats?.eventsJobs?.events || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)'
      },
      {
        label: 'Job Postings',
        data: stats?.eventsJobs?.jobs || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)'
      }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">College Analytics</h2>
          <p className="text-gray-600 mt-1">Detailed insights and statistics</p>
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          label="Total Users"
          value={stats?.summary?.totalUsers || 0}
          change={`${stats?.summary?.userGrowth || 0}% growth`}
          trend={stats?.summary?.userGrowth > 0 ? 'up' : 'down'}
          color="blue"
        />
        <StatsCard
          icon={Activity}
          label="Active Users"
          value={stats?.summary?.activeUsers || 0}
          change={`${stats?.summary?.activeRate || 0}% active`}
          color="green"
        />
        <StatsCard
          icon={Calendar}
          label="Total Events"
          value={stats?.summary?.totalEvents || 0}
          change={`${stats?.summary?.upcomingEvents || 0} upcoming`}
          color="purple"
        />
        <StatsCard
          icon={Briefcase}
          label="Job Postings"
          value={stats?.summary?.totalJobs || 0}
          change={`${stats?.summary?.activeJobs || 0} active`}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-gray-600" />
            User Distribution
          </h3>
          <div className="h-64">
            <Pie 
              data={userDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Monthly Registrations Line Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
            Monthly Registrations
          </h3>
          <div className="h-64">
            <Line 
              data={monthlyRegistrationsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Events & Jobs Bar Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
            Events & Job Postings Trend
          </h3>
          <div className="h-64">
            <Bar 
              data={eventsJobsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Active Users */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {stats?.topActiveUsers?.map((user, index) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-500">#{index + 1}</span>
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.activities} activities</p>
                  <p className="text-xs text-gray-500">Last {timeRange}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
          <div className="space-y-3">
            {stats?.departmentStats?.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">{dept.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{dept.count}</span>
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