// pages/JobDetailsPage.jsx
import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  Briefcase, DollarSign, Users, ExternalLink, Calendar,
  Edit, Trash2, UserCheck, Clock, Award
} from 'lucide-react'
import { format } from 'date-fns'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { useAuth } from '../context/AuthContext'
import { jobService } from '../services/jobs'
import toast from 'react-hot-toast'

const JobDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobDetails(id)
  })

  const showInterestMutation = useMutation({
    mutationFn: (requestReferral) => jobService.showInterest(id, { requestReferral }),
    onSuccess: () => {
      toast.success('Interest shown successfully!')
      refetch()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to show interest')
    }
  })

  const grantReferralMutation = useMutation({
    mutationFn: (userId) => jobService.grantReferral(id, userId),
    onSuccess: () => {
      toast.success('Referral granted successfully!')
      refetch()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => jobService.deleteJob(id),
    onSuccess: () => {
      toast.success('Job deleted successfully')
      navigate('/jobs')
    }
  })

  const handleShowInterest = () => {
    if (data?.job?.referralAvailable && data?.job?.availableReferrals > 0) {
      setShowReferralModal(true)
    } else {
      showInterestMutation.mutate(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    )
  }

  const job = data?.job
  const canManage = data?.canManage
  const hasShownInterest = data?.hasShownInterest
  const hasRequestedReferral = data?.hasRequestedReferral
  const referralGranted = data?.referralGranted

  const targetAudienceLabels = {
    my_batch: 'My Batch',
    seniors: 'Seniors',
    juniors: 'Juniors',
    all: 'All Students'
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job?.title}</h1>
              <p className="text-xl text-gray-600">{job?.company}</p>
            </div>
            
            {canManage && (
              <div className="flex space-x-2">
                <Link
                  to={`/jobs/${id}/edit`}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
              <span className="font-medium">{job?.package}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-3 text-gray-400" />
              For: {targetAudienceLabels[job?.targetAudience]}
            </div>
            <div className="flex items-center text-gray-600">
              <Award className="w-5 h-5 mr-3 text-gray-400" />
              Experience: {job?.experienceRequired === 'any' ? 'Any' : job?.experienceRequired + ' years'}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-3 text-gray-400" />
              Posted {format(new Date(job?.createdAt), 'MMM d, yyyy')}
            </div>
          </div>

          {/* Referral Info */}
          {job?.referralAvailable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Referrals Available: {job.availableReferrals} of {job.referralCount}
                  </span>
                </div>
                {canManage && job.interestedUsers.filter(iu => iu.requestedReferral).length > 0 && (
                  <Link
                    to={`/jobs/${id}/interested`}
                    className="text-sm text-green-700 hover:underline"
                  >
                    View Referral Requests →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {job?.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-3">
              <img
                src={job?.postedBy?.profileImage || `https://ui-avatars.com/api/?name=${job?.postedBy?.firstName}+${job?.postedBy?.lastName}`}
                alt={job?.postedBy?.firstName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{job?.postedBy?.firstName} {job?.postedBy?.lastName}</p>
                <p className="text-sm text-gray-500">{job?.postedBy?.role?.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href={job?.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Apply Now
              </a>
              
              {!canManage && (
                hasShownInterest ? (
                  <div className="text-sm">
                    {referralGranted ? (
                      <span className="text-green-600 font-medium">✓ Referral Granted</span>
                    ) : hasRequestedReferral ? (
                      <span className="text-yellow-600">⏳ Referral Requested</span>
                    ) : (
                      <span className="text-gray-600">✓ Interest Shown</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleShowInterest}
                    className="btn-primary"
                  >
                    Show Interest
                  </button>
                )
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
            <span>{job?.views} views</span>
            <span>{job?.interestedUsers?.length || 0} interested</span>
            {job?.referralAvailable && (
              <span>{job?.interestedUsers?.filter(iu => iu.referralGranted).length || 0} referrals granted</span>
            )}
          </div>
        </div>

        {/* Interested Users (for job poster) */}
        {canManage && job?.interestedUsers?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h2 className="text-xl font-semibold mb-4">Interested Candidates</h2>
            <div className="space-y-3">
              {job.interestedUsers.map(({ user: interestedUser, requestedReferral, referralGranted }) => (
                <div key={interestedUser._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={interestedUser.profileImage || `https://ui-avatars.com/api/?name=${interestedUser.firstName}+${interestedUser.lastName}`}
                      alt={interestedUser.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{interestedUser.firstName} {interestedUser.lastName}</p>
                      <p className="text-sm text-gray-500">{interestedUser.email}</p>
                    </div>
                  </div>
                  
                  {requestedReferral && (
                    <div>
                      {referralGranted ? (
                        <span className="text-green-600">✓ Referral Granted</span>
                      ) : job.availableReferrals > 0 ? (
                        <button
                          onClick={() => grantReferralMutation.mutate(interestedUser._id)}
                          className="btn-primary text-sm"
                          disabled={grantReferralMutation.isLoading}
                        >
                          Grant Referral
                        </button>
                      ) : (
                                                <span className="text-gray-500">No referrals left</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Request Modal */}
        <Modal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          title="Request Referral?"
          size="small"
        >
          <p className="text-gray-600 mb-6">
            Would you like to request a referral for this position? The job poster will be notified of your request.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowReferralModal(false)
                showInterestMutation.mutate(false)
              }}
              className="btn-secondary"
            >
              Just Interested
            </button>
            <button
              onClick={() => {
                setShowReferralModal(false)
                showInterestMutation.mutate(true)
              }}
              className="btn-primary"
            >
              Request Referral
            </button>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Job Posting"
          size="small"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this job posting? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              className="btn-danger"
            >
              Delete Job
            </button>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default JobDetailsPage