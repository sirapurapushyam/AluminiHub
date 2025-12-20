import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Shield, CheckCircle, Users, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import Modal from '../common/Modal'
import Pagination from '../common/Pagination'
import { userService } from '../../services/users'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch pending users
  const { data: pendingUsers, isLoading: loadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['pendingUsers', user.collegeCode],
    queryFn: () => userService.getPendingUsers(user.collegeCode),
    enabled: activeTab === 'pending'
  })

  // Fetch approved users based on tab
  const { data: approvedUsers, isLoading: loadingApproved, refetch: refetchApproved } = useQuery({
    queryKey: ['approvedUsers', user.collegeCode, activeTab, currentPage, searchQuery],
    queryFn: () => userService.getCollegeUsers(user.collegeCode, {
      role: activeTab,
      page: currentPage,
      limit: 10,
      search: searchQuery
    }),
    enabled: activeTab !== 'pending'
  })

  const approveMutation = useMutation({
    mutationFn: (userId) => userService.approveUser(userId, 'approved'),
    onSuccess: () => {
      toast.success('User approved successfully')
      // Invalidate queries for both pending and the role they will now appear in
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] })
      queryClient.invalidateQueries({ queryKey: ['approvedUsers'] })
      refetchPending()
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }) => userService.approveUser(userId, 'rejected', reason),
    onSuccess: () => {
      toast.success('User rejected')
      setShowRejectModal(false)
      setSelectedUser(null)
      setRejectionReason('')
      queryClient.invalidateQueries({ queryKey: ['pendingUsers'] })
      refetchPending()
    }
  })

  const promoteMutation = useMutation({
    mutationFn: (userId) => userService.promoteUser(userId),
    onSuccess: () => {
      toast.success('User promoted to Admin')
      queryClient.invalidateQueries({ queryKey: ['approvedUsers'] })
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Promotion failed')
  })

  const handleReject = () => {
    if (selectedUser && rejectionReason) {
      rejectMutation.mutate({ userId: selectedUser._id, reason: rejectionReason })
    }
  }

  const UserRow = ({ user, showActions = false }) => {
    const roleColors = {
      student: 'bg-green-100 text-green-800',
      alumni: 'bg-blue-100 text-blue-800',
      faculty: 'bg-purple-100 text-purple-800',
      college_admin: 'bg-red-100 text-red-800'
    }

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-4">
          <img
            src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
            alt={user.firstName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
            {user.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => approveMutation.mutate(user._id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title="Approve"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedUser(user)
                setShowRejectModal(true)
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Reject"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {activeTab === 'faculty' && user.role !== 'college_admin' && (
          <div className="flex space-x-2">
            <button
              onClick={() => promoteMutation.mutate(user._id)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Promote to Admin"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    )
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery('')
  }

  const renderContent = () => {
    const isLoading = activeTab === 'pending' ? loadingPending : loadingApproved
    const data = activeTab === 'pending' ? pendingUsers?.users : approvedUsers?.users
    const pagination = approvedUsers?.pagination

    if (isLoading) {
      return <div className="flex justify-center py-12"><LoadingSpinner size="large" /></div>
    }

    if (!data || data.length === 0) {
      const title = activeTab === 'pending' ? 'No pending approvals' : `No ${activeTab}s found`
      const description = activeTab === 'pending' ? 'All users have been reviewed' : `No users with the role '${activeTab}' found.`
      return <EmptyState icon={activeTab === 'pending' ? CheckCircle : Users} title={title} description={description} />
    }

    return (
      <>
        <div className="space-y-3">
          {data.map(u => (
            <UserRow key={u._id} user={u} showActions={activeTab === 'pending'} />
          ))}
        </div>
        {pagination && pagination.pages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {['pending', 'student', 'alumni', 'faculty'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`pb-2 px-1 capitalize ${activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search Bar for approved users */}
      {activeTab !== 'pending' && (
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={`Search for ${activeTab}s...`}
            className="input pl-10"
          />
        </div>
      )}

      {renderContent()}

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User"
        size="small"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to reject {selectedUser?.firstName} {selectedUser?.lastName}'s registration?
        </p>
        <div className="mb-6">
          <label className="label">Reason for rejection</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="input min-h-[100px]"
            placeholder="Please provide a reason..."
            required
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowRejectModal(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={!rejectionReason || rejectMutation.isLoading}
            className="btn-danger"
          >
            {rejectMutation.isLoading ? <LoadingSpinner size="small" color="white" /> : 'Reject User'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsers