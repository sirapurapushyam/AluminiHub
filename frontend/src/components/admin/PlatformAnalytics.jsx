import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Building2, Users, TrendingUp, Globe,
  Activity, BarChart3, Map, Database
} from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import StatsCard from '../common/StatsCard'
import api from '../../services/api'
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
import { Bar, Doughnut, Line } from 'react-chartjs-2'

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

const PlatformAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['platformAnalytics', timeRange],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?range=${timeRange}`)
      return response.data.stats
    }
  })

  if (isLoading) return <LoadingSpinner size="large" />

  // Platform growth chart
  const growthData = {
    labels: analytics?.growth?.labels || [],
    datasets: [
      {
        label: 'Colleges',
        data: analytics?.growth?.colleges || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      },
      {
        label: 'Users',
        data: analytics?.growth?.users || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      }
    ]
  }

  // College distribution by status
  const collegeStatusData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [
        analytics?.colleges?.approved || 0,
        analytics?.colleges?.pending || 0,
        analytics?.colleges?.rejected || 0
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-gray-600 mt-1">Global platform statistics and insights</p>
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

      {/* Platform Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Building2}
          label="Total Colleges"
          value={analytics?.colleges?.total || 0}
          change={`${analytics?.colleges?.growth || 0}% growth`}
          trend={analytics?.colleges?.growth > 0 ? 'up' : 'down'}
          color="blue"
        />
        <StatsCard
          icon={Users}
          label="Total Users"
          value={analytics?.users?.total || 0}
          change={`${analytics?.users?.growth || 0}% growth`}
          trend={analytics?.users?.growth > 0 ? 'up' : 'down'}
          color="green"
        />
        <StatsCard
          icon={Activity}
          label="Platform Activity"
          value={`${analytics?.activity?.rate || 0}%`}
          change="Engagement rate"
          color="purple"
        />
        <StatsCard
          icon={Database}
          label="Total Events"
          value={analytics?.events?.total || 0}
          change={`${analytics?.events?.upcoming || 0} upcoming`}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
            Platform Growth
          </h3>
          <div className="h-80">
            <Line
              data={growthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* College Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-gray-600" />
            College Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut
              data={collegeStatusData}
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

        {/* Geographic Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Map className="w-5 h-5 mr-2 text-gray-600" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {analytics?.geographic?.top?.map((location) => (
              <div key={location.state} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm">{location.state}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16 text-right">
                    {location.count} colleges
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Platform Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Role Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Role Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Students</span>
              <span className="font-bold text-blue-600">{analytics?.users?.byRole?.student || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Alumni</span>
              <span className="font-bold text-green-600">{analytics?.users?.byRole?.alumni || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium">Faculty</span>
              <span className="font-bold text-purple-600">{analytics?.users?.byRole?.faculty || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
              <span className="font-medium">College Admins</span>
              <span className="font-bold text-orange-600">{analytics?.users?.byRole?.college_admin || 0}</span>
            </div>
          </div>
        </div>

        {/* Top Colleges by Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Most Active Colleges</h3>
          <div className="space-y-3">
            {analytics?.topColleges?.map((college, index) => (
              <div key={college._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${index < 3 ? 'text-primary-600' : 'text-gray-500'}`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{college.name}</p>
                    <p className="text-xs text-gray-600">{college.userCount} users</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {college.activityScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">User Retention</span>
                <span className="text-sm font-medium">{analytics?.health?.retention || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${analytics?.health?.retention || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Approval Rate</span>
                <span className="text-sm font-medium">{analytics?.health?.approvalRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${analytics?.health?.approvalRate || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-sm font-medium">{analytics?.health?.uptime || 99.9}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${analytics?.health?.uptime || 99.9}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformAnalytics