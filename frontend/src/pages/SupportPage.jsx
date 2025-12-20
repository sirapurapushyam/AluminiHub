import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { LifeBuoy, Plus, Search, Filter, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import { useAuth } from '../context/AuthContext'
import { queryService } from '../services/queries'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

// New Query Form Component
const QueryForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { isStudent, isAlumni, isFaculty, isCollegeAdmin } = useAuth()
  
  const categories = [
    'technical', 'account', 'events', 'jobs', 
    'mentorship', 'general', 'academic', 'administrative'
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="label">Category</label>
        <select {...register('category', { required: 'Category is required' })} className="input">
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && <p className="error-text">{errors.category.message}</p>}
      </div>
      
      <div>
        <label className="label">Subject</label>
        <input 
          {...register('subject', { 
            required: 'Subject is required',
            maxLength: { value: 200, message: 'Subject must be less than 200 characters' }
          })} 
          className="input" 
          placeholder="Brief description of your query" 
        />
        {errors.subject && <p className="error-text">{errors.subject.message}</p>}
      </div>
      
      <div>
        <label className="label">Description</label>
        <textarea 
          {...register('description', { 
            required: 'Please describe your issue in detail',
            maxLength: { value: 5000, message: 'Description must be less than 5000 characters' }
          })} 
          className="input min-h-[120px] resize-y" 
          placeholder="Provide detailed information about your query..."
        />
        {errors.description && <p className="error-text">{errors.description.message}</p>}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg text-sm">
        <p className="text-blue-800">
          <strong>Note:</strong> Your query will be visible to 
          {(isStudent || isAlumni) && ' faculty members and college administrators'}
          {isFaculty && ' college administrators'}
          {isCollegeAdmin && ' other college administrators'}
        </p>
      </div>
      
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => onSubmit(null)} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Submit Query'}
        </button>
      </div>
    </form>
  )
}

// Query Card Component for Mobile View
const QueryCard = ({ query, onClick, isAdmin }) => {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'resolved': 
      case 'closed': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'text-blue-600 bg-blue-50'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div 
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3 ${
        isAdmin ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{query.subject}</h3>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(query.status)}`}>
          {getStatusIcon(query.status)}
          {query.status.replace('_', ' ')}
              </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
          {query.category}
        </span>
        <span className={`px-2 py-1 rounded-full ${getPriorityColor(query.priority)}`}>
          {query.priority} priority
        </span>
      </div>
      
      {isAdmin && query.user && (
        <p className="text-sm text-gray-600">
          By: {query.user.firstName} {query.user.lastName} ({query.user.role})
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        {format(new Date(query.createdAt), 'MMM d, yyyy h:mm a')}
      </p>
    </div>
  )
}

const SupportPage = () => {
  const { user, isStudent, isAlumni, isFaculty, isCollegeAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [showQueryModal, setShowQueryModal] = useState(false)
  const [activeTab, setActiveTab] = useState('my-queries')
  const [filters, setFilters] = useState({ status: 'all', category: 'all' })
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  // Determine if user can see other queries
  const canSeeOtherQueries = isFaculty || isCollegeAdmin

  // Fetch my queries
  const { data: myQueriesData, isLoading: isLoadingMyQueries } = useQuery({
    queryKey: ['my-queries', currentPage, filters.status],
    queryFn: () => queryService.getMyQueries({ 
      page: currentPage, 
      limit: 10,
      status: filters.status !== 'all' ? filters.status : undefined
    })
  })

  // Fetch other queries (for faculty and admin)
  const { data: otherQueriesData, isLoading: isLoadingOtherQueries } = useQuery({
    queryKey: ['queries', currentPage, filters],
    queryFn: () => queryService.getQueries({ 
      page: currentPage, 
      limit: 10,
      status: filters.status !== 'all' ? filters.status : undefined,
      category: filters.category !== 'all' ? filters.category : undefined
    }),
    enabled: canSeeOtherQueries && activeTab === 'all-queries'
  })

  const createQueryMutation = useMutation({
    mutationFn: (queryData) => queryService.createQuery(queryData),
    onSuccess: () => {
      toast.success('Your query has been submitted successfully!')
      setShowQueryModal(false)
      queryClient.invalidateQueries(['my-queries'])
      queryClient.invalidateQueries(['queries'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit query')
    }
  })

  const handleCreateQuery = (formData) => {
    if (!formData) {
      setShowQueryModal(false)
      return
    }
    createQueryMutation.mutate(formData)
  }

  const handleQueryClick = (query) => {
    if (canSeeOtherQueries || query.user === user._id) {
      navigate(`/support/${query._id}`)
    }
  }

  const currentData = activeTab === 'my-queries' ? myQueriesData : otherQueriesData
  const isLoading = activeTab === 'my-queries' ? isLoadingMyQueries : isLoadingOtherQueries
  const queries = currentData?.queries || []

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      )
    }

    const filteredQueries = queries.filter(query => 
      searchTerm === '' || 
      query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filteredQueries.length === 0) {
      return (
        <EmptyState
          icon={LifeBuoy}
          title={activeTab === 'my-queries' 
            ? "You haven't submitted any queries" 
            : "No queries found"}
          description={activeTab === 'my-queries'
            ? "Get help with any issues you're facing."
            : "No queries match your search criteria."}
          action={activeTab === 'my-queries' ? { 
            label: "Submit a New Query", 
            onClick: () => setShowQueryModal(true) 
          } : null}
        />
      )
    }

    return (
      <>
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {filteredQueries.map(query => (
            <QueryCard
              key={query._id}
              query={query}
              onClick={() => handleQueryClick(query)}
              isAdmin={canSeeOtherQueries && activeTab === 'all-queries'}
            />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'all-queries' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQueries.map(query => (
                <tr 
                  key={query._id} 
                  onClick={() => handleQueryClick(query)}
                  className={canSeeOtherQueries || activeTab === 'my-queries' 
                    ? 'cursor-pointer hover:bg-gray-50' 
                    : ''}
                >
                  {activeTab === 'all-queries' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {query.user?.firstName} {query.user?.lastName}
                        </div>
                        <div className="text-gray-500">{query.user?.role}</div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="line-clamp-2 max-w-xs">{query.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {query.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      query.priority === 'urgent' ? 'text-red-600' :
                      query.priority === 'high' ? 'text-orange-600' :
                      query.priority === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {query.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(query.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(query.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentData?.pagination?.pages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={currentData.pagination.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-1">Get help and support for your queries</p>
          </div>
          <button onClick={() => setShowQueryModal(true)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">New Query</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Tabs */}
        {canSeeOtherQueries && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('my-queries')
                  setCurrentPage(1)
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-queries'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Queries
              </button>
              <button
                onClick={() => {
                  setActiveTab('all-queries')
                  setCurrentPage(1)
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-queries'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {isFaculty ? 'Student Queries' : 'All Queries'}
              </button>
            </nav>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            {activeTab === 'all-queries' && (
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="technical">Technical</option>
                <option value="account">Account</option>
                <option value="events">Events</option>
                <option value="jobs">Jobs</option>
                <option value="mentorship">Mentorship</option>
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="administrative">Administrative</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* New Query Modal */}
      <Modal 
        isOpen={showQueryModal} 
        onClose={() => setShowQueryModal(false)} 
        title="Submit a New Query"
      >
        <QueryForm 
          onSubmit={handleCreateQuery} 
          isLoading={createQueryMutation.isLoading} 
        />
      </Modal>
    </Layout>
  )
}

export default SupportPage