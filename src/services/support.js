import api from './api'

const supportService = {
  // Create support ticket
  createTicket: async (subject, message) => {
    const response = await api.post('/support', {
      subject,
      message,
    })
    return response.data
  },

  // Get user's tickets
  getMyTickets: async () => {
    const response = await api.get('/support')
    return response.data
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/support/${id}`)
    return response.data
  },

  // Admin: Update ticket
  updateTicket: async (id, status, response) => {
    const responseData = await api.put(`/support/${id}`, {
      status,
      response,
    })
    return responseData.data
  },

  // Admin: Delete ticket
  deleteTicket: async (id) => {
    const response = await api.delete(`/support/${id}`)
    return response.data
  },
}

export default supportService