import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { ArrowLeft, User, Calendar, Tag, Shield, Save, LifeBuoy } from 'lucide-react'
import toast from 'react-hot-toast'

import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { queryService } from '../services/queries'
import { userService } from '../services/users'
import { useAuth } from '../context/AuthContext'

const AdminQueryDetailsPage = () => {
  const { queryId } = useParams()
  const { user: adminUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: queryData, isLoading: isLoadingQuery } = useQuery({
    queryKey: ['query', queryId],
    queryFn: () => queryService.getQuery(queryId)
  })

  const { data: adminsData } = useQuery({
    queryKey: ['collegeAdmins', adminUser.collegeCode],
    queryFn: () => userService.getCollegeUsers(adminUser.collegeCode, { role: 'college_admin', limit: 100 }),
    enabled: !!adminUser.collegeCode
  })

  const { register, handleSubmit, reset } = useForm()

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
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update query')
    }
  })

  const onSubmit = (formData) => {
    updateMutation.mutate(formData)
  }

  const query = queryData?.query

  if (isLoadingQuery) {
    return <Layout><div className="flex justify-center py-12"><LoadingSpinner size="large" /></div></Layout>
  }

  if (!query) {
    return <Layout><div className="text-center py-12">Query not found.</div></Layout>
  }

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status]}`}>{status.replace('_', ' ')}</span>
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <Link to="/support" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Support Center
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Query Details */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm space-y-6">
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-900">{query.subject}</h1>
                {getStatusBadge(query.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Ticket #{query._id.substring(query._id.length - 6).toUpperCase()}
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span>Submitted by: <strong>{query.user.firstName} {query.user.lastName}</strong> ({query.user.email})</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <span>Submitted on: {format(new Date(query.createdAt), 'PPP p')}</span>
              </div>
              <div className="flex items-center">
                <Tag className="w-5 h-5 mr-3 text-gray-400" />
                <span>Category: <span className="font-medium">{query.category}</span></span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-3 text-gray-400" />
                <span>Priority: <span className="font-medium">{query.priority}</span></span>
              </div>
              {query.assignedTo && (
                <div className="flex items-center">
                  <LifeBuoy className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Assigned to: <strong>{query.assignedTo.firstName} {query.assignedTo.lastName}</strong></span>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{query.description}</p>
            </div>

            {query.resolution && (
              <div className="prose max-w-none border-t pt-6">
                <h3 className="text-lg font-semibold mb-2 text-green-700">Resolution</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{query.resolution}</p>
                <p className="text-sm text-gray-500 mt-2">Resolved on: {format(new Date(query.resolvedAt), 'PPP p')}</p>
              </div>
            )}
          </div>

          {/* Right Column: Admin Actions */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <h2 className="text-xl font-semibold border-b pb-3">Manage Ticket</h2>
              
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
                </select>
              </div>

              <div>
                <label className="label">Assign To</label>
                <select {...register('assignedTo')} className="input">
                  <option value="">Unassigned</option>
                  {adminsData?.users.map(admin => (
                    <option key={admin._id} value={admin._id}>
                      {admin.firstName} {admin.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Resolution / Notes</label>
                <textarea
                  {...register('resolution')}
                  className="input min-h-[150px]"
                  placeholder="Add resolution details or internal notes..."
                />
              </div>

              <button type="submit" disabled={updateMutation.isLoading} className="btn-primary w-full">
                {updateMutation.isLoading ? <LoadingSpinner size="small" color="white" /> : <><Save className="w-4 h-4 mr-2" /> Update Ticket</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminQueryDetailsPage