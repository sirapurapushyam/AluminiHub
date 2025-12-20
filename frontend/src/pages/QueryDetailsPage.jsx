import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { 
  ArrowLeft, User, Calendar, Tag, Shield, Save, LifeBuoy, 
  MessageSquare, Send, Clock, CheckCircle, AlertCircle,
  FileText, Users
} from 'lucide-react'
import toast from 'react-hot-toast'

import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import { queryService } from '../services/queries'
import { userService } from '../services/users'
import { useAuth } from '../context/AuthContext'

const QueryDetailsPage = () => {
  const { queryId } = useParams()
  const navigate = useNavigate()
  const { user, isFaculty, isCollegeAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [comment, setComment] = useState('')

  const { data: queryData, isLoading: isLoadingQuery } = useQuery({
    queryKey: ['query', queryId],
    queryFn: () => queryService.getQuery(queryId)
  })

  const { data: adminsData } = useQuery({
    queryKey: ['assignableUsers', user.collegeCode],
    queryFn: async () => {
      if (isCollegeAdmin) {
        return userService.getCollegeUsers(user.collegeCode, { role: 'college_admin', limit: 100 })
      } else if (isFaculty) {
        // Faculty can assign to other faculty or college admins
        const [faculty, admins] = await Promise.all([
          userService.getCollegeUsers(user.collegeCode, { role: 'faculty', limit: 100 }),
          userService.getCollegeUsers(user.collegeCode, { role: 'college_admin', limit: 100 })
        ])
        return { users: [...faculty.users, ...admins.users] }
      }
      return { users: [] }
    },
    enabled: (isFaculty || isCollegeAdmin) && !!user.collegeCode
  })

  const { register, handleSubmit, reset, watch } = useForm()
  const watchStatus = watch('status')

  useEffect(() => {
    if (queryData?.query) {
      reset({
        status: queryData.query.status || 'open',
        priority: queryData.query.priority || 'medium',
        assignedTo: queryData.query.assignedTo?._id || '',
        resolution: queryData.query.resolution || ''
      })
    }
  }, [queryData, reset])

  const updateMutation = useMutation({
    mutationFn: (updateData) => queryService.updateQuery(queryId, updateData),
    onSuccess: () => {
      toast.success('Query updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['query', queryId] })
      queryClient.invalidateQueries({ queryKey: ['queries'] })
      queryClient.invalidateQueries({ queryKey: ['my-queries'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update query')
    }
  })

  const commentMutation = useMutation({
    mutationFn: (commentData) => queryService.addComment(queryId, commentData),
    onSuccess: () => {
      toast.success('Comment added!')
      setShowCommentModal(false)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['query', queryId] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    }
  })

  const onSubmit = (formData) => {
    updateMutation.mutate(formData)
  }

  const handleAddComment = () => {
    if (comment.trim()) {
      commentMutation.mutate({ comment: comment.trim() })
    }
  }

  const query = queryData?.query
  const isOwnQuery = query?.user._id === user._id
  const canManage = (isFaculty || isCollegeAdmin) && !isOwnQuery

  if (isLoadingQuery) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    )
  }

  if (!query) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Query not found.</p>
          <Link to="/support" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
            Back to Support Center
          </Link>
        </div>
      </Layout>
    )
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-5 h-5" />
      case 'in_progress': return <Clock className="w-5 h-5" />
      case 'resolved': 
      case 'closed': return <CheckCircle className="w-5 h-5" />
      default: return null
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full inline-flex items-center gap-2 ${colors[status]}`}>
        {getStatusIcon(status)}
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[priority]}`}>
        {priority} priority
      </span>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/support" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Support Center
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Header */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{query.subject}</h1>
                  <p className="text-sm text-gray-500">
                    Query ID: #{query._id.substring(query._id.length - 6).toUpperCase()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(query.status)}
                  {getPriorityBadge(query.priority)}
                </div>
              </div>

              {/* Query Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start">
                  <User className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Submitted by</p>
                    <p className="font-medium">{query.user.firstName} {query.user.lastName}</p>
                    <p className="text-gray-500">{query.user.email}</p>
                    <p className="text-gray-500 capitalize">({query.user.role})</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Submitted on</p>
                    <p className="font-medium">{format(new Date(query.createdAt), 'PPP')}</p>
                    <p className="text-gray-500">{format(new Date(query.createdAt), 'p')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Tag className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium capitalize">{query.category}</p>
                  </div>
                </div>

                {query.assignedTo && (
                  <div className="flex items-start">
                    <LifeBuoy className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-500">Assigned to</p>
                      <p className="font-medium">{query.assignedTo.firstName} {query.assignedTo.lastName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                Description
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">{query.description}</p>
              </div>
            </div>

            {/* Resolution */}
            {query.resolution && (
              <div className="bg-green-50 border border-green-200 p-4 sm:p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Resolution
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{query.resolution}</p>
                {query.resolvedAt && (
                  <p className="text-sm text-gray-500 mt-3">
                    Resolved on {format(new Date(query.resolvedAt), 'PPP p')}
                    {query.resolvedBy && ` by ${query.resolvedBy.firstName} ${query.resolvedBy.lastName}`}
                  </p>
                )}
              </div>
            )}

            {/* Comments */}
            {query.comments && query.comments.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
                  Comments ({query.comments.length})
                </h3>
                <div className="space-y-4">
                  {query.comments.map((comment, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">
                          {comment.user.firstName} {comment.user.lastName}
                          <span className="text-gray-500 font-normal ml-2">({comment.user.role})</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <p className="text-gray-600">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Comment Button */}
            <button
              onClick={() => setShowCommentModal(true)}
              className="btn-secondary w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add Comment
            </button>
          </div>

          {/* Sidebar - Admin Actions */}
          {canManage && (
            <div className="lg:col-span-1">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-6 sticky top-4">
                <h2 className="text-xl font-semibold border-b pb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gray-400" />
                  Manage Query
                </h2>
                
                <div>
                  <label className="label">Status</label>
                  <select {...register('status')} className="input">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select {...register('priority')} className="input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="label">Assign To</label>
                  <select {...register('assignedTo')} className="input">
                    <option value="">Unassigned</option>
                    {adminsData?.users.map(admin => (
                      <option key={admin._id} value={admin._id}>
                        {admin.firstName} {admin.lastName} ({admin.role})
                      </option>
                    ))}
                  </select>
                </div>

                {(watchStatus === 'resolved' || watchStatus === 'closed') && (
                  <div>
                    <label className="label">Resolution</label>
                    <textarea
                      {...register('resolution')}
                      className="input min-h-[120px] resize-y"
                      placeholder="Describe how the issue was resolved..."
                    />
                  </div>
                )}

                <button type="submit" disabled={updateMutation.isLoading} className="btn-primary w-full">
                  {updateMutation.isLoading ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Query
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Comment Modal */}
        <Modal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          title="Add Comment"
        >
          <div className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input min-h-[100px] resize-y"
              placeholder="Enter your comment..."
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCommentModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!comment.trim() || commentMutation.isLoading}
                className="btn-primary"
              >
                {commentMutation.isLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Add Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default QueryDetailsPage