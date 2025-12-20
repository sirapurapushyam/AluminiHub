// pages/PostJobPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Briefcase, Info } from 'lucide-react'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { jobService } from '../services/jobs'
import toast from 'react-hot-toast'

const PostJobPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    package: '',
    externalLink: '',
    description: '',
    targetAudience: 'all',
    experienceRequired: 'any',
    referralAvailable: false,
    referralCount: 0
  })

  const postJobMutation = useMutation({
    mutationFn: jobService.postJob,
    onSuccess: () => {
      toast.success('Job posted successfully!')
      navigate('/jobs')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post job')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    postJobMutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Post Job Opportunity</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="label">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input"
                  placeholder="Google"
                  required
                />
              </div>

              <div>
                <label className="label">Package/Salary *</label>
                <input
                  type="text"
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  className="input"
                  placeholder="12-15 LPA"
                  required
                />
              </div>

              <div>
                <label className="label">Application Link *</label>
                <input
                  type="url"
                  name="externalLink"
                  value={formData.externalLink}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://careers.company.com/job-id"
                  required
                />
              </div>

              <div>
                <label className="label">Target Audience *</label>
                <select
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="all">All Students & Alumni</option>
                  <option value="my_batch">My Batch Only</option>
                  <option value="juniors">My Juniors</option>
                  <option value="seniors">My Seniors</option>
                </select>
              </div>

              <div>
                <label className="label">Experience Required</label>
                <select
                  name="experienceRequired"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="any">Any</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Additional Information (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Any additional details about the role, requirements, or application process..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="referralAvailable"
                  checked={formData.referralAvailable}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="font-medium">I can provide referrals</span>
              </label>

              {formData.referralAvailable && (
                <div className="mt-3">
                  <label className="label">Number of referrals available</label>
                  <input
                    type="number"
                    name="referralCount"
                    value={formData.referralCount}
                    onChange={handleChange}
                    className="input w-32"
                    min="1"
                    max="10"
                    required={formData.referralAvailable}
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p>Your job post will be visible to {formData.targetAudience === 'all' ? 'all students and alumni' : formData.targetAudience.replace('_', ' ')} in your college.</p>
                  <p className="mt-1">All members will receive a notification about this opportunity.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={postJobMutation.isLoading}
                className="btn-primary"
              >
                {postJobMutation.isLoading ? <LoadingSpinner size="small" color="white" /> : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default PostJobPage