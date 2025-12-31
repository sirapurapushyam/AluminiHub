import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, UserCheck, UserX, Eye, User, X, Mail, Phone, Calendar, Building } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { debounce } from 'lodash' // or implement your own debounce

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [loadingUser, setLoadingUser] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  

  // Debounce search term
  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value)
    }, 500),
    []
  )

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])
useEffect(() => {
  setPage(1)
}, [filterRole, filterStatus, debouncedSearchTerm])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminUsers', user.collegeCode, filterRole, debouncedSearchTerm,page],
   queryFn: async () => {
  const params = new URLSearchParams()

  if (filterRole !== 'all') params.append('role', filterRole)
  if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)

  params.append('page', page)
  params.append('limit', limit)

  const response = await api.get(
    `/users/college/${user.collegeCode}?${params.toString()}`
  )

  return response.data
},

    keepPreviousData: true, // Keep showing old data while fetching new
  })

  const approveMutation = useMutation({
    mutationFn: async ({ userId, status, rejectionReason }) => {
      const response = await api.put(`/users/approval/${userId}`, {
        status,
        rejectionReason
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers'])
      toast.success('User status updated successfully')
      setShowUserModal(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status')
    }
  })

  const handleApproval = (userId, status) => {
    if (status === 'rejected') {
      const reason = prompt('Please provide a reason for rejection:')
      if (!reason) return
      approveMutation.mutate({ userId, status, rejectionReason: reason })
    } else {
      if (confirm('Are you sure you want to approve this user?')) {
        approveMutation.mutate({ userId, status })
      }
    }
  }

  const handleViewUser = async (userId) => {
    setLoadingUser(true)
    try {
      const response = await api.get(`/users/profile/${userId}`)
      setSelectedUser(response.data.user)
      setShowUserModal(true)
    } catch (error) {
      toast.error('Failed to load user details')
    } finally {
      setLoadingUser(false)
    }
  }

  // Filter users by approval status
  const filteredUsers = data?.users?.filter(user => {
    if (filterStatus === 'all') return true
    return user.approvalStatus === filterStatus
  }) || []

  if (isLoading && !data) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-gray-600 mt-1">Manage and approve user registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">
  {data?.approvalStats?.pending || 0}
</p>

            </div>
            <UserX className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-700">
  {data?.approvalStats?.approved || 0}
</p>

            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700">
  {data?.approvalStats?.rejected || 0}
</p>

            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-700">
  {data?.pagination?.total || 0}
</p>

            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isFetching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="alumni">Alumni</option>
              <option value="faculty">Faculty</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                          alt=""
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.studentId || user.employeeId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        user.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        {user.approvalStatus === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproval(user._id, 'approved')}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                              title="Approve User"
                              disabled={approveMutation.isLoading}
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApproval(user._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Reject User"
                              disabled={approveMutation.isLoading}
                            >
                              <UserX className="w-5 h-5" />
                            </button>
                          </>
                        ) : null}
                        <button 
                          onClick={() => handleViewUser(user._id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                          title="View User Details"
                          disabled={loadingUser}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
{data?.pagination && data.pagination.pages > 1 && (
  <div className="flex justify-end items-center gap-4 mt-4">
    <button
      className="px-3 py-1 border rounded disabled:opacity-50"
      disabled={page === 1}
      onClick={() => setPage(p => p - 1)}
    >
      Prev
    </button>

    <span className="text-sm text-gray-600">
      Page {data.pagination.page} of {data.pagination.pages}
    </span>

    <button
      className="px-3 py-1 border rounded disabled:opacity-50"
      disabled={page === data.pagination.pages}
      onClick={() => setPage(p => p + 1)}
    >
      Next
    </button>
  </div>
)}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.profileImage || `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                                        <Mail className="w-4 h-4" />
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      selectedUser.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedUser.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser.approvalStatus.charAt(0).toUpperCase() + selectedUser.approvalStatus.slice(1)}
                    </span>
                    <span className="ml-2 inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 capitalize">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Basic Information */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Basic Information
                </h5>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">ID</p>
                    <p className="font-medium">{selectedUser.studentId || selectedUser.employeeId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium">{selectedUser.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Designation</p>
                    <p className="font-medium">{selectedUser.designation || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined Date</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              {selectedUser.profile && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Profile Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    {selectedUser.profile.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedUser.profile.phone}
                        </p>
                      </div>
                    )}
                    {selectedUser.profile.graduationYear && (
                      <div>
                        <p className="text-sm text-gray-600">Graduation Year</p>
                        <p className="font-medium">{selectedUser.profile.graduationYear}</p>
                      </div>
                    )}
                    {selectedUser.profile.company && (
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{selectedUser.profile.company}</p>
                      </div>
                    )}
                    {selectedUser.profile.position && (
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{selectedUser.profile.position}</p>
                      </div>
                    )}
                    {selectedUser.profile.location && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{selectedUser.profile.location}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedUser.profile.bio && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="font-medium bg-gray-50 p-3 rounded-lg">{selectedUser.profile.bio}</p>
                    </div>
                  )}

                  {/* Skills and Interests */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedUser.profile.skills && selectedUser.profile.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.profile.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedUser.profile.interests && selectedUser.profile.interests.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.profile.interests.map((interest, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {(selectedUser.profile.linkedIn || selectedUser.profile.github || selectedUser.profile.website) && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Social Links</p>
                      <div className="flex space-x-4">
                        {selectedUser.profile.linkedIn && (
                          <a 
                            href={selectedUser.profile.linkedIn} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            LinkedIn
                          </a>
                        )}
                        {selectedUser.profile.github && (
                          <a 
                            href={selectedUser.profile.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-gray-900"
                          >
                            GitHub
                          </a>
                        )}
                        {selectedUser.profile.website && (
                          <a 
                            href={selectedUser.profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Approval Information */}
              {(selectedUser.approvedAt || selectedUser.rejectedAt) && (
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Approval Information</h5>
                  {selectedUser.approvedAt && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Approved on</p>
                      <p className="text-green-800">{new Date(selectedUser.approvedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedUser.rejectedAt && (
                    <div className="bg-red-50 p-3 rounded-lg mt-2">
                      <p className="text-sm text-red-600">Rejected on</p>
                      <p className="text-red-800">{new Date(selectedUser.rejectedAt).toLocaleString()}</p>
                      {selectedUser.rejectionReason && (
                        <>
                          <p className="text-sm text-red-600 mt-2">Reason:</p>
                          <p className="text-red-800">{selectedUser.rejectionReason}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Actions */}
            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              {selectedUser.approvalStatus === 'pending' && (
                <>
                  <button
                    onClick={() => handleApproval(selectedUser._id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    disabled={approveMutation.isLoading}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleApproval(selectedUser._id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    disabled={approveMutation.isLoading}
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              {selectedUser.approvalStatus === 'rejected' && (
                <button
                  onClick={() => handleApproval(selectedUser._id, 'approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  disabled={approveMutation.isLoading}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Approve Now</span>
                </button>
              )}
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers