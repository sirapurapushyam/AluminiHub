// src/components/donations/DonationStats.jsx
import React, { useState, useEffect } from 'react'
import donationService from '../../services/donations'
import { useAuth } from '../../context/AuthContext'
import { TrendingUp, Heart, Users, Award } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const DonationStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.collegeCode) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await donationService.getDonationStats(user.collegeCode)
      setStats(response)
    } catch (error) {
      console.error('Failed to fetch donation stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const purposeChartData = {
    labels: stats?.purposeStats?.map(p => p._id.charAt(0).toUpperCase() + p._id.slice(1)) || [],
    datasets: [{
      data: stats?.purposeStats?.map(p => p.amount) || [],
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6',
        '#6B7280'
      ],
      borderWidth: 0
    }]
  }

  const monthlyChartData = {
    labels: stats?.monthlyStats?.map(m => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${months[m._id.month - 1]} ${m._id.year}`
    }).reverse() || [],
    datasets: [{
      label: 'Monthly Donations',
      data: stats?.monthlyStats?.map(m => m.amount).reverse() || [],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.3
    }]
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats?.stats?.totalAmount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.stats?.totalDonations || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Donation</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(stats?.stats?.avgDonation || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Highest Donation</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats?.stats?.maxDonation?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purpose Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Donations by Purpose</h3>
          {stats?.purposeStats && stats.purposeStats.length > 0 ? (
            <div className="h-64">
              <Doughnut
                data={purposeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 15,
                        font: { size: 12 }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
          {stats?.monthlyStats && stats.monthlyStats.length > 0 ? (
            <div className="h-64">
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${value.toLocaleString()}`
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Top Donors */}
      {stats?.topDonors && stats.topDonors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Donors</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Donor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Donations</th>
                </tr>
              </thead>
              <tbody>
                {stats.topDonors.map((donor, index) => (
                  <tr key={donor._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-700'
                      } font-semibold text-sm`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {donor.donor?.firstName || ''} {donor.donor?.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-500">{donor.donor?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">
                        ₹{donor.totalAmount?.toLocaleString() || 0}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {donor.count || 0} donations
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonationStats