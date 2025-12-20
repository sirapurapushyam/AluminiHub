import api from './api'

export const queryService = {
  /**
   * Create a new query
   */
  createQuery: async (queryData) => {
    const response = await api.post('/queries', queryData)
    return response.data
  },

  /**
   * Get queries submitted by the current user
   */
  getMyQueries: async (params = {}) => {
    const response = await api.get('/queries/my-queries', { params })
    return response.data
  },

  /**
   * Get queries (for faculty and admin to see others' queries)
   */
  getQueries: async (params = {}) => {
    const response = await api.get('/queries', { params })
    return response.data
  },

  /**
   * Get all queries for the college (admin) - deprecated, use getQueries instead
   */
  getCollegeQueries: async (params = {}) => {
    const response = await api.get('/queries', { params })
    return response.data
  },

  /**
   * Get a single query by ID
   */
  getQuery: async (queryId) => {
    const response = await api.get(`/queries/${queryId}`)
    return response.data
  },

  /**
   * Update a query (faculty and admin)
   */
  updateQuery: async (queryId, updateData) => {
    const response = await api.put(`/queries/${queryId}`, updateData)
    return response.data
  },

  /**
   * Add a comment to a query
   */
  addComment: async (queryId, commentData) => {
    const response = await api.post(`/queries/${queryId}/comments`, commentData)
    return response.data
  }
}