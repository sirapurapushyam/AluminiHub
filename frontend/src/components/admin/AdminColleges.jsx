import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, Filter, CheckCircle, XCircle, Eye, Clock, Building2, 
  X, Mail, Phone, MapPin, Calendar, Globe, Users, Shield
} from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { debounce } from 'lodash'

const AdminColleges = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [showCollegeModal, setShowCollegeModal] = useState(false)
  const [loadingCollege, setLoadingCollege] = useState(false)
  const queryClient = useQueryClient()

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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminColleges', filterStatus],
    queryFn: async () => {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
      const response = await api.get(`/admin/colleges${params}`)
      return response.data
    },
    keepPreviousData: true,
  })

  const approveMutation = useMutation({
    mutationFn: async ({ collegeId, status, rejectionReason }) => {
      const response = await api.put(`/admin/colleges/${collegeId}/approval`, {
        status,
        rejectionReason
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminColleges'])
      toast.success('College status updated successfully')
      setShowCollegeModal(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update college status')
    }
  })

  const handleApproval = (collegeId, status) => {
    if (status === 'rejected') {
      const reason = prompt('Please provide a reason for rejection:')
      if (!reason) return
      approveMutation.mutate({ collegeId, status, rejectionReason: reason })
    } else {
      if (confirm('Are you sure you want to approve this college? A unique code will be generated.')) {
        approveMutation.mutate({ collegeId, status })
      }
    }
  }

  const handleViewCollege = async (college) => {
    setSelectedCollege(college)
    setShowCollegeModal(true)
    // Fetch additional details if needed
    try {
      setLoadingCollege(true)
      // You can fetch more details here if needed
      // const response = await api.get(`/admin/colleges/${college._id}`)
      // setSelectedCollege(response.data.college)
    } catch (error) {
      toast.error('Failed to load college details')
    } finally {
      setLoadingCollege(false)
    }
  }

  const filteredColleges = data?.colleges?.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      college.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      college.uniqueCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesTab = selectedTab === 'all' || college.status === selectedTab
    
    return matchesSearch && matchesTab
  }) || []

  const tabs = [
    { id: 'all', label: 'All Colleges', count: data?.colleges?.length || 0, color: 'gray' },
    { id: 'approved', label: 'Approved', count: data?.colleges?.filter(c => c.status === 'approved').length || 0, color: 'green' },
    { id: 'pending', label: 'Pending', count: data?.colleges?.filter(c => c.status === 'pending').length || 0, color: 'yellow' },
    // { id: 'rejected', label: 'Rejected', count: data?.colleges?.filter(c => c.status === 'rejected').length || 0, color: 'red' },
  ]

  if (isLoading && !data) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">College Management</h2>
        <p className="text-gray-600 mt-1">Manage and approve college registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Colleges</p>
              <p className="text-2xl font-bold text-blue-700">
                {data?.colleges?.length || 0}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="card bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-700">
                {data?.colleges?.filter(c => c.status === 'pending').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Active Colleges</p>
              <p className="text-2xl font-bold text-green-700">
                {data?.colleges?.filter(c => c.status === 'approved').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Total Users</p>
              <p className="text-2xl font-bold text-purple-700">
                {data?.colleges?.reduce((acc, college) => acc + (college.stats?.totalUsers || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs bg-${tab.color}-100 text-${tab.color}-700`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search colleges by name, email or code..."
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

      {/* Colleges Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No colleges found
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr key={college._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {college.name}
                        </div>
                        <div className="text-sm text-gray-500">{college.email}</div>
                        <div className="text-sm text-gray-500">{college.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {college.adminUser && (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {college.adminUser.firstName} {college.adminUser.lastName}
                          </div>
                          <div className="text-gray-500">{college.adminUser.email}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {college.uniqueCode ? (
                        <span className="font-mono text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
                          {college.uniqueCode}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        college.status === 'approved' ? 'bg-green-100 text-green-800' :
                        college.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {college.status.charAt(0).toUpperCase() + college.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {college.stats?.totalUsers || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(college.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        {college.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproval(college._id, 'approved')}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                              title="Approve College"
                              disabled={approveMutation.isLoading}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApproval(college._id, 'rejected')}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Reject College"
                              disabled={approveMutation.isLoading}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        ) : null}
                        <button 
                          onClick={() => handleViewCollege(college)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                          title="View College Details"
                          disabled={loadingCollege}
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

      {/* College Details Modal */}
      {showCollegeModal && selectedCollege && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold">College Details</h3>
              <button
                onClick={() => setShowCollegeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* College Header */}
              <div className="flex items-start justify-between">
                                <div className="flex-1">
                  <h4 className="text-2xl font-semibold">
                    {selectedCollege.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{selectedCollege.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{selectedCollege.phone}</span>
                  </div>
                  {selectedCollege.website && (
                    <div className="flex items-center space-x-2 text-gray-600 mt-1">
                      <Globe className="w-4 h-4" />
                      <a href={selectedCollege.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedCollege.website}
                      </a>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      selectedCollege.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedCollege.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedCollege.status.charAt(0).toUpperCase() + selectedCollege.status.slice(1)}
                    </span>
                    {selectedCollege.uniqueCode && (
                      <span className="ml-2 inline-block px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full font-mono">
                        Code: {selectedCollege.uniqueCode}
                      </span>
                    )}
                  </div>
                </div>
                {selectedCollege.logo && (
                  <img
                    src={selectedCollege.logo}
                    alt={`${selectedCollege.name} logo`}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* Address Information */}
              {selectedCollege.address && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address Information
                  </h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {selectedCollege.address.street}<br />
                      {selectedCollege.address.city}, {selectedCollege.address.state} {selectedCollege.address.zipCode}<br />
                      {selectedCollege.address.country}
                    </p>
                  </div>
                </div>
              )}

              {/* College Information */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  College Information
                </h5>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  {selectedCollege.establishedYear && (
                    <div>
                      <p className="text-sm text-gray-600">Established Year</p>
                      <p className="font-medium">{selectedCollege.establishedYear}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium capitalize">{selectedCollege.type || 'College'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-medium">{new Date(selectedCollege.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedCollege.accreditation?.status && (
                    <div>
                      <p className="text-sm text-gray-600">Accreditation</p>
                      <p className="font-medium capitalize">{selectedCollege.accreditation.status}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Information */}
              {selectedCollege.adminUser && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Information
                  </h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedCollege.adminUser.profileImage || `https://ui-avatars.com/api/?name=${selectedCollege.adminUser.firstName}+${selectedCollege.adminUser.lastName}`}
                        alt="Admin"
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">
                          {selectedCollege.adminUser.firstName} {selectedCollege.adminUser.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{selectedCollege.adminUser.email}</p>
                        <p className="text-sm text-gray-500">College Administrator</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              {selectedCollege.stats && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Statistics
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700">{selectedCollege.stats.totalStudents || 0}</p>
                      <p className="text-sm text-blue-600">Students</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">{selectedCollege.stats.totalAlumni || 0}</p>
                      <p className="text-sm text-green-600">Alumni</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-700">{selectedCollege.stats.totalFaculty || 0}</p>
                      <p className="text-sm text-purple-600">Faculty</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedCollege.description && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3">About</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedCollege.description}</p>
                  </div>
                </div>
              )}

              {/* Social Media Links */}
              {selectedCollege.socialMedia && Object.values(selectedCollege.socialMedia).some(v => v) && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-3">Social Media</h5>
                  <div className="flex space-x-4">
                    {selectedCollege.socialMedia.facebook && (
                      <a 
                        href={selectedCollege.socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Facebook
                      </a>
                    )}
                    {selectedCollege.socialMedia.twitter && (
                      <a 
                        href={selectedCollege.socialMedia.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600"
                      >
                        Twitter
                      </a>
                    )}
                    {selectedCollege.socialMedia.linkedin && (
                      <a 
                        href={selectedCollege.socialMedia.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900"
                      >
                        LinkedIn
                      </a>
                    )}
                    {selectedCollege.socialMedia.instagram && (
                      <a 
                        href={selectedCollege.socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Approval/Rejection Information */}
              {(selectedCollege.approvedAt || selectedCollege.rejectedAt) && (
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Status Information</h5>
                  {selectedCollege.approvedAt && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Approved on</p>
                      <p className="text-green-800">{new Date(selectedCollege.approvedAt).toLocaleString()}</p>
                      {selectedCollege.approvedBy && (
                        <p className="text-sm text-green-600 mt-1">By Super Admin</p>
                      )}
                    </div>
                  )}
                  {selectedCollege.rejectedAt && (
                    <div className="bg-red-50 p-3 rounded-lg mt-2">
                      <p className="text-sm text-red-600">Rejected on</p>
                      <p className="text-red-800">{new Date(selectedCollege.rejectedAt).toLocaleString()}</p>
                      {selectedCollege.rejectionReason && (
                        <>
                          <p className="text-sm text-red-600 mt-2">Reason:</p>
                          <p className="text-red-800">{selectedCollege.rejectionReason}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Actions */}
            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              {selectedCollege.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApproval(selectedCollege._id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    disabled={approveMutation.isLoading}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleApproval(selectedCollege._id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    disabled={approveMutation.isLoading}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              {selectedCollege.status === 'rejected' && (
                <button
                  onClick={() => handleApproval(selectedCollege._id, 'approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  disabled={approveMutation.isLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Now</span>
                </button>
              )}
              <button
                onClick={() => setShowCollegeModal(false)}
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

export default AdminColleges