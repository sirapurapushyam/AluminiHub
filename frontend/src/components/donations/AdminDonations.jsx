// src/components/donations/AdminDonations.jsx
import React, { useState, useEffect } from 'react'
import donationService from '../../services/donations'
import { useAuth } from '../../context/AuthContext'
import { Search, Filter, Download, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { formatDate } from '../../utils/dateUtils'
import toast from 'react-hot-toast'

const AdminDonations = () => {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filters, setFilters] = useState({
    purpose: 'all',
    status: 'all',
    search: ''
  })
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [updateStatusModal, setUpdateStatusModal] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState(null)

  useEffect(() => {
    fetchDonations()
  }, [filters, user])

  const fetchDonations = async () => {
    if (!user?.collegeCode) return
    
    try {
      const response = await donationService.getCollegeDonations(user.collegeCode, {
        purpose: filters.purpose !== 'all' ? filters.purpose : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        page: 1,
        limit: 50
      })
      setDonations(response.donations || [])
    } catch (error) {
      console.error('Failed to fetch donations:', error)
      toast.error('Failed to load donations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (donationId, newStatus, reason = '') => {
    setUpdating(donationId)
    try {
      const response = await donationService.updateDonationStatus(donationId, { 
        status: newStatus, 
        reason: reason || undefined 
      })
      
      if (response.success) {
        toast.success(`Donation ${newStatus === 'completed' ? 'approved' : 'status updated'} successfully`)
        setUpdateStatusModal(false)
        setSelectedDonation(null)
        
        // Update the donation in the list without refetching
        setDonations(prevDonations => 
          prevDonations.map(d => 
            d._id === donationId ? { ...d, status: newStatus } : d
          )
        )
      }
    } catch (error) {
      console.error('Status update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update donation status')
    } finally {
      setUpdating(null)
    }
  }

  const handleQuickApprove = async (donationId) => {
    if (window.confirm('Are you sure you want to approve this donation?')) {
      await handleStatusUpdate(donationId, 'completed')
    }
  }

  const openStatusModal = (donation, status) => {
    setSelectedDonation(donation)
    setStatusToUpdate(status)
    setUpdateStatusModal(true)
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusClasses[status] || ''}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    )
  }

  const filteredDonations = donations.filter(donation => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const donorName = donation.isAnonymous ? 'anonymous' : 
        `${donation.donor?.firstName || ''} ${donation.donor?.lastName || ''}`.toLowerCase()
      return donorName.includes(searchLower) || 
        donation.transactionId.toLowerCase().includes(searchLower)
    }
    return true
  })

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm">
        {/* Header with Filters */}
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-xl font-semibold">All Donations</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search donor or transaction ID"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.purpose}
                onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Purposes</option>
                <option value="general">General</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="scholarship">Scholarship</option>
                <option value="event">Event</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No donations found
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {donation.isAnonymous ? 'Anonymous' : 
                            `${donation.donor?.firstName || ''} ${donation.donor?.lastName || ''}`}
                        </p>
                        {!donation.isAnonymous && donation.donor?.email && (
                          <p className="text-sm text-gray-500">{donation.donor.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{donation.amount?.toLocaleString() || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 capitalize">{donation.purpose}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 font-mono">{donation.transactionId}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatDate(donation.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {donation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickApprove(donation._id)}
                              disabled={updating === donation._id}
                              className={`text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed`}
                              title="Approve donation"
                            >
                              {updating === donation._id ? (
                                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => openStatusModal(donation, 'failed')}
                              disabled={updating === donation._id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Mark as failed"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {donation.status === 'completed' && (
                          <button
                            onClick={() => openStatusModal(donation, 'refunded')}
                            disabled={updating === donation._id}
                            className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            title="Process refund"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {updateStatusModal && selectedDonation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setUpdateStatusModal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                {statusToUpdate === 'failed' ? 'Mark as Failed' : 'Process Refund'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Donor</p>
                  <p className="font-medium">
                    {selectedDonation.isAnonymous ? 'Anonymous' : 
                      `${selectedDonation.donor?.firstName || ''} ${selectedDonation.donor?.lastName || ''}`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
// Continue AdminDonations.jsx
                  <p className="font-medium">₹{selectedDonation.amount?.toLocaleString() || 0}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason {statusToUpdate === 'failed' && '(Required)'}
                  </label>
                  <textarea
                    id="reason"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder={`Enter reason for ${statusToUpdate === 'failed' ? 'failure' : 'refund'}`}
                    required={statusToUpdate === 'failed'}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      const reason = document.getElementById('reason').value
                      if (statusToUpdate === 'failed' && !reason.trim()) {
                        toast.error('Please provide a reason for failure')
                        return
                      }
                      handleStatusUpdate(selectedDonation._id, statusToUpdate, reason)
                    }}
                    className={`flex-1 text-white py-2 rounded-lg ${
                      statusToUpdate === 'failed' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    Confirm {statusToUpdate === 'failed' ? 'Failure' : 'Refund'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setUpdateStatusModal(false)
                      setSelectedDonation(null)
                      setStatusToUpdate(null)
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminDonations