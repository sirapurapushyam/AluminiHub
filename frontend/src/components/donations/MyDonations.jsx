// src/components/donations/MyDonations.jsx
import React, { useState, useEffect } from 'react'
import donationService from '../../services/donations'
import { Download, Eye } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'

const MyDonations = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalDonated, setTotalDonated] = useState(0)

  useEffect(() => {
    fetchMyDonations()
  }, [])

  const fetchMyDonations = async () => {
    try {
      const response = await donationService.getMyDonations()
      setDonations(response.donations || [])
      setTotalDonated(response.totalDonated || 0)
    } catch (error) {
      console.error('Failed to fetch donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
// Continue MyDonations.jsx
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">My Donations</h3>
      
      <div className="mb-4 bg-primary-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Total Donated</p>
        <p className="text-2xl font-bold text-primary-700">₹{totalDonated.toLocaleString()}</p>
      </div>

      {donations.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No donations yet</p>
      ) : (
        <div className="space-y-3">
          {donations.slice(0, 5).map((donation) => (
            <div key={donation._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">₹{donation.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 capitalize">{donation.purpose}</p>
                  <p className="text-xs text-gray-500">{formatDate(donation.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(donation.status)}
                  {donation.status === 'completed' && (
                    <button className="text-gray-400 hover:text-gray-600" title="Download receipt">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyDonations