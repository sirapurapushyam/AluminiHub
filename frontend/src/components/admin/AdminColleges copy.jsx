import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Building2, Check, X, Globe, Mail, Phone } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'
import Modal from '../common/Modal'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AdminColleges = () => {
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  // Fetch pending colleges
  const { data: pendingColleges, isLoading: loadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['pendingColleges'],
    queryFn: async () => {
      const response = await api.get('/admin/colleges/pending')
      return response.data
    },
    enabled: activeTab === 'pending'
  })

  // Fetch all colleges
  const { data: allColleges, isLoading: loadingAll } = useQuery({
    queryKey: ['allColleges'],
    queryFn: async () => {
      const response = await api.get('/admin/colleges')
      return response.data
    },
    enabled: activeTab === 'all'
  })

  const approveMutation = useMutation({
    mutationFn: (collegeId) => api.put(`/admin/colleges/${collegeId}/approval`, { status: 'approved' }),
    onSuccess: () => {
      toast.success('College approved successfully')
      refetchPending()
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ collegeId, reason }) => 
      api.put(`/admin/colleges/${collegeId}/approval`, { status: 'rejected', rejectionReason: reason }),
    onSuccess: () => {
      toast.success('College rejected')
      setShowRejectModal(false)
      setSelectedCollege(null)
      setRejectionReason('')
      refetchPending()
    }
  })

  const handleReject = () => {
    if (selectedCollege && rejectionReason) {
      rejectMutation.mutate({ collegeId: selectedCollege._id, reason: rejectionReason })
    }
  }

  const CollegeCard = ({ college, showActions = false }) => {
    // ✅ Safe fallback for missing approvalStatus
    const status = (college.approvalStatus ?? 'pending').toLowerCase()

    const statusColors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }

    return (
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{college.name || 'Unnamed College'}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
              {status.toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
            {college.code || 'N/A'}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {college.website && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              <a href={college.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                {college.website}
              </a>
            </div>
          )}
          {college.contactEmail && (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {college.contactEmail}
            </div>
          )}
          {college.contactPhone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {college.contactPhone}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Admin:</span> {college.adminUser?.firstName || ''} {college.adminUser?.lastName || ''}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> 
            {college.city || 'N/A'}, {college.state || 'N/A'}, {college.country || 'N/A'}
          </p>
        </div>

        {showActions && (
          <div className="flex space-x-2 mt-4 pt-4 border-t">
            <button
              onClick={() => approveMutation.mutate(college._id)}
              className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => {
                setSelectedCollege(college)
                setShowRejectModal(true)
              }}
              className="flex-1 btn-danger"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-1 ${activeTab === 'pending' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
        >
          All Colleges
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <>
          {loadingPending ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : pendingColleges?.colleges?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingColleges.colleges
                .filter(college => !!college) // prevent null/undefined crash
                .map(college => (
                  <CollegeCard key={college._id} college={college} showActions />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={Check}
              title="No pending colleges"
              description="All college registrations have been reviewed"
            />
          )}
        </>
      ) : (
        <>
          {loadingAll ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : allColleges?.colleges?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allColleges.colleges
                .filter(college => !!college)
                .map(college => (
                  <CollegeCard key={college._id} college={college} />
                ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No colleges found"
              description="No colleges registered yet"
            />
          )}
        </>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject College"
        size="small"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to reject {selectedCollege?.name || 'this college'}'s registration?
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
            {rejectMutation.isLoading ? <LoadingSpinner size="small" color="white" /> : 'Reject College'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminColleges
