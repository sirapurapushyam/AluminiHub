import api from './api'

export const messageService = {
  // Send message
  sendMessage: async (formData) => {
    const response = await api.post('/messages/send', formData)
    return response.data
  },

  // Get conversations
  getConversations: async () => {
    const response = await api.get('/messages/conversations')
    return response.data
  },

  // Get messages with user
  getUserMessages: async (userId, params = {}) => {
    const response = await api.get(`/messages/user/${userId}`, { params })
    return response.data
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`)
    return response.data
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`)
    return response.data
  }
}