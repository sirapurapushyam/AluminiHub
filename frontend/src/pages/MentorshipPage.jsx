// pages/MentorshipPage.js
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GraduationCap, Search, Users, BookOpen, Check, X, Calendar, Clock, Star, TrendingUp, Award, Building2, Globe } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import ConfirmationModal from '../components/common/ConfirmationModal'
import Tabs from '../components/common/Tabs'
import MentorCard from '../components/mentorship/MentorCard'
import MentorshipRequestForm from '../components/mentorship/MentorshipRequestForm'
import { useAuth } from '../context/AuthContext'
import { mentorshipService } from '../services/mentorship'
// Add this import at the top of MentorshipPage.js
import RecommendationSummary from '../components/mentorship/RecommendationSummary'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react'; // or your icon library


const MentorshipPage = () => {
  const { user, isStudent } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(isStudent ? 'recommendations' : 'requests')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('all')
  
  // New state for college filter in recommendations
  const [collegeFilter, setCollegeFilter] = useState('same') // 'same' or 'other'

  const tabs = isStudent
    ? [
        { label: 'Recommended for You', value: 'recommendations', icon: TrendingUp },
        { label: 'Find All Mentors', value: 'find', icon: Search },
        { label: 'My Mentorships', value: 'my-mentorships', icon: BookOpen }
      ]
    : [
        { label: 'Mentorship Requests', value: 'requests', icon: Users },
        { label: 'My Mentees', value: 'my-mentees', icon: GraduationCap }
      ]

  const areasOfInterest = [
    { value: 'all', label: 'All Areas' },
    { value: 'career', label: 'Career Development' },
    { value: 'academics', label: 'Academic Guidance' },
    { value: 'research', label: 'Research Projects' },
    { value: 'entrepreneurship', label: 'Entrepreneurship' },
    { value: 'personal_development', label: 'Personal Development' },
    { value: 'other', label: 'Other' }
  ]

  // Fetch data based on active tab
  const { data, isLoading } = useQuery({
    queryKey: ['mentorship', activeTab, searchQuery, selectedArea],
    queryFn: () => {
      switch (activeTab) {
        case 'recommendations':
          return mentorshipService.getMentorRecommendations()
        case 'find':
          return mentorshipService.getAvailableMentors({
            search: searchQuery,
            area: selectedArea !== 'all' ? selectedArea : undefined
          })
        case 'my-mentorships':
          return mentorshipService.getMyMentorships()
        case 'requests':
          return mentorshipService.getMentorshipRequests()
        case 'my-mentees':
          return mentorshipService.getMentorshipRequests({ status: 'ongoing' })
        default:
          return Promise.resolve(null)
      }
    }
  })

  const requestMutation = useMutation({
    mutationFn: (requestData) => mentorshipService.requestMentorship(requestData),
    onSuccess: () => {
      toast.success('Mentorship request sent successfully!')
      setShowRequestModal(false)
      setSelectedMentor(null)
      queryClient.invalidateQueries(['mentorship'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send request')
    }
  })

  const responseMutation = useMutation({
    mutationFn: ({ requestId, status, responseMessage }) =>
      mentorshipService.respondToRequest(requestId, { status, responseMessage }),
    onSuccess: (data) => {
      toast.success(`Request ${data.mentorship.status === 'ongoing' ? 'accepted' : 'rejected'}`)
      setShowResponseModal(false)
      setSelectedRequest(null)
      queryClient.invalidateQueries(['mentorship', 'requests'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to respond to request')
    }
  })

  const handleRequestMentor = (mentor) => {
    setSelectedMentor(mentor)
    setShowRequestModal(true)
  }

  const handleSendRequest = (formData) => {
    requestMutation.mutate({ ...formData, mentorId: selectedMentor._id })
  }

  const handleAcceptRequest = (request) => {
    responseMutation.mutate({ requestId: request._id, status: 'accepted' })
  }

  const handleRejectRequest = (request) => {
    setSelectedRequest(request)
    setShowResponseModal(true)
  }

 // In MentorshipPage.js - Replace the renderRecommendations function
const renderRecommendations = () => {
  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="large" /></div>

  const sameCollege = data?.sameCollege || []
  const otherCollege = data?.otherCollege || []

  if (sameCollege.length === 0 && otherCollege.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No recommendations available"
        description="We couldn't find any mentor recommendations for you. Try updating your profile skills and interests, or browse all mentors."
      />
    )
  }

  // Get the mentors to display based on selected filter
  const displayMentors = collegeFilter === 'same' ? sameCollege : otherCollege

  return (
    <div className="space-y-6">
      {/* Fallback message */}
      {data?.fallback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Award className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{data.message}</p>
          </div>
        </div>
      )}

      {/* Recommendation Summary */}
      <RecommendationSummary 
        sameCollege={sameCollege}
        otherCollege={otherCollege}
        onCollegeFilterChange={setCollegeFilter}
        activeFilter={collegeFilter}
      />

            {/* College Filter Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCollegeFilter('same')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
              collegeFilter === 'same'
                ? 'bg-white text-green-700 shadow-sm ring-1 ring-green-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Your College
            {sameCollege.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                collegeFilter === 'same' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {sameCollege.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCollegeFilter('other')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all ${
              collegeFilter === 'other'
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            Other Colleges
            {otherCollege.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                collegeFilter === 'other' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {otherCollege.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="text-center">
        <h3 className={`text-xl font-semibold mb-2 ${
          collegeFilter === 'same' ? 'text-green-700' : 'text-blue-700'
        }`}>
          {collegeFilter === 'same' ? 'Mentors from Your College' : 'Mentors from Other Colleges'}
        </h3>
        <p className="text-gray-600">
          {displayMentors.length} mentor{displayMentors.length !== 1 ? 's' : ''} recommended based on your profile
        </p>
      </div>

      {/* Display Mentors */}
      {displayMentors.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayMentors.map((mentor, index) => (
              <div key={mentor._id} className="relative">
                <MentorCard 
                  mentor={mentor} 
                  onRequest={handleRequestMentor}
                  showRecommendationScore={true}
                />
                {/* Match Score Badge */}
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  collegeFilter === 'same' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {Math.round(mentor.recommendationScore * 100)}% match
                </div>
                {/* Ranking Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                  index < 3 
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button (if you want to implement pagination later) */}
          {displayMentors.length >= 6 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Showing top {displayMentors.length} recommendations
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={collegeFilter === 'same' ? Building2 : Globe}
          title={`No recommendations from ${collegeFilter === 'same' ? 'your college' : 'other colleges'}`}
          description={
            collegeFilter === 'same' 
              ? "We couldn't find any recommended mentors from your college. Try checking other colleges or updating your profile with more skills and interests."
              : "We couldn't find any recommended mentors from other colleges. Try checking your college mentors first or updating your profile."
          }
        />
      )}

      {/* Call to Action */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">
          Can't find the right mentor?
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Try updating your profile with more skills and interests, or browse all available mentors
        </p>
        <button
          onClick={() => setActiveTab('find')}
          className="btn-secondary"
        >
          <Search className="w-4 h-4 mr-2" />
          Browse All Mentors
        </button>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Add more skills to your profile to get better matches</li>
          <li>• Include your interests and career goals</li>
          <li>• {collegeFilter === 'same' ? 'Try exploring mentors from other colleges too' : 'Check mentors from your college for easier networking'}</li>
          <li>• Look for mentors with experience in your field of interest</li>
        </ul>
      </div>
    </div>
  )
}
            
  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="large" /></div>

    switch (activeTab) {
      case 'recommendations':
        return renderRecommendations()
      
      case 'find':
        return (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, designation, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="input lg:w-64"
                >
                  {areasOfInterest.map(area => (
                    <option key={area.value} value={area.value}>{area.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {data?.mentors?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.mentors.map(mentor => (
                  <MentorCard key={mentor._id} mentor={mentor} onRequest={handleRequestMentor} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No mentors found"
                description="Try adjusting your search criteria or check back later."
              />
            )}
          </>
        )
      
      case 'requests':
        return (
          data?.requests?.length > 0 ? (
            <div className="space-y-4">
              {data.requests.map(req => (
                <div key={req._id} className="card">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <img
                          src={req.mentee.profileImage || `https://ui-avatars.com/api/?name=${req.mentee.firstName}+${req.mentee.lastName}`}
                          alt={`${req.mentee.firstName} ${req.mentee.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {req.mentee.firstName} {req.mentee.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Requested mentorship in <span className="font-semibold text-primary-600">
                              {areasOfInterest.find(a => a.value === req.area)?.label || req.area}
                            </span>
                          </p>
                          <div className="mt-2 space-y-2">
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm font-medium text-gray-700 mb-1">What they want to learn:</p>
                              <p className="text-sm text-gray-600">{req.description}</p>
                            </div>
                            {req.goals && req.goals.length > 0 && (
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm font-medium text-gray-700 mb-1">Goals:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {req.goals.map((goal, index) => (
                                    <li key={index}>{goal}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm font-medium text-gray-700 mb-1">Message:</p>
                              <p className="text-sm text-gray-600 italic">"{req.requestMessage}"</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row lg:flex-col gap-2 lg:gap-3">
                      <button 
                        onClick={() => handleAcceptRequest(req)}
                        className="flex-1 lg:flex-initial btn-secondary bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(req)}
                        className="flex-1 lg:flex-initial btn-secondary bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No pending requests"
              description="You have no new mentorship requests."
            />
          )
        )
      
      case 'my-mentorships':
      case 'my-mentees':
        const mentorships = data?.mentorships || data?.requests
        return (
          mentorships?.length > 0 ? (
            <div className="space-y-4">
              {mentorships.map(m => (
                <div key={m._id} className="card">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                                            <div className="flex items-start gap-3">
                        <img
                          src={(isStudent ? m.mentor : m.mentee).profileImage || 
                            `https://ui-avatars.com/api/?name=${(isStudent ? m.mentor : m.mentee).firstName}+${(isStudent ? m.mentor : m.mentee).lastName}`}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {isStudent ? 'Mentor' : 'Mentee'}: {(isStudent ? m.mentor : m.mentee).firstName} {(isStudent ? m.mentor : m.mentee).lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Area: <span className="font-semibold">
                              {areasOfInterest.find(a => a.value === m.area)?.label || m.area}
                            </span>
                          </p>
                          {m.startDate && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              Started: {new Date(m.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`badge ${
                        m.status === 'ongoing' ? 'badge-success' :
                        m.status === 'completed' ? 'badge-info' :
                        m.status === 'pending' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                  {m.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">{m.description}</p>
                    </div>
                  )}
                  {/* Added profile/message links */}
            {/* <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
              <Link
                to={`/profile/${m._id}`}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                View Profile
              </Link>
              <Link
                to={`/messages?user=${m._id}`}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Message
              </Link>
            </div> */}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No mentorships yet"
              description={isStudent ? "Your mentorship connections will appear here." : "Your active mentorships will appear here."}
            />
          )
        )
      
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentorship Program</h1>
            <p className="text-gray-600 mt-2">
              {isStudent
                ? 'Connect with alumni and faculty for guidance and support'
                : 'Help students grow through mentorship and guidance'
              }
            </p>
          </div>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-6">
          {renderContent()}
        </div>
      </div>

      {selectedMentor && (
        <Modal
          isOpen={showRequestModal}
          onClose={() => {
            setShowRequestModal(false)
            setSelectedMentor(null)
          }}
          title={`Request Mentorship from ${selectedMentor.firstName} ${selectedMentor.lastName}`}
          size="medium"
        >
          <MentorshipRequestForm
            mentor={selectedMentor}
            onSubmit={handleSendRequest}
            isLoading={requestMutation.isLoading}
          />
        </Modal>
      )}

      {selectedRequest && (
        <ConfirmationModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false)
            setSelectedRequest(null)
          }}
          onConfirm={(reason) => responseMutation.mutate({ 
            requestId: selectedRequest._id, 
            status: 'rejected', 
            responseMessage: reason 
          })}
          title="Reject Mentorship Request"
          description={`Are you sure you want to reject the request from ${selectedRequest.mentee.firstName} ${selectedRequest.mentee.lastName}? You can provide a reason below (optional).`}
          confirmText="Reject Request"
          confirmColor="danger"
          isLoading={responseMutation.isLoading}
          requiresReason={true}
          reasonLabel="Reason for rejection (optional)"
          reasonPlaceholder="Please provide feedback to help the student understand..."
        />
      )}
    </Layout>
  )
}

export default MentorshipPage