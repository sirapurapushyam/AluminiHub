// services/jobs.js
import api from './api'

export const jobService = {
  // Post Job
  postJob: async (jobData) => {
    const response = await api.post('/jobs', jobData)
    return response.data
  },

  // Get Jobs
  getJobs: async (params = {}) => {
    console.log('Fetching jobs with params:', params);
    const response = await api.get('/jobs', { params });
    console.log('Jobs response:', response.data);
    return response.data;
  },

  // Get Job Details
  getJobDetails: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`)
    return response.data
  },

  // Update Job
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData)
    return response.data
  },

  // Delete Job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`)
    return response.data
  },

  // Show Interest
  showInterest: async (jobId, data) => {
    const response = await api.post(`/jobs/${jobId}/interest`, data)
    return response.data
  },

  // Get Interested Users
  getInterestedUsers: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/interested-users`)
    return response.data
  },

  // Grant Referral
  grantReferral: async (jobId, userId) => {
    const response = await api.post(`/jobs/${jobId}/grant-referral`, { userId })
    return response.data
  },

  // Get My Posted Jobs
  getMyJobs: async (params = {}) => {
    const response = await api.get('/jobs/my-jobs', { params })
    return response.data
  },
}