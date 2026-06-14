import api from './api'

const paymentsService = {
  createPayment: async (bookingId, gateway = 'xendit') => {
    const response = await api.post('/payments/create', {
      booking_id: bookingId,
      gateway: gateway,
    })
    return response.data
  },

  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payments/${bookingId}`)
    return response.data
  },

  getPendingConfirmations: async () => {
    const response = await api.get('/payments/pending')
    return response.data
  },

  // ✅ BARU: konfirmasi atau tolak (staff)
  confirmPayment: async (paymentId, action, notes = '') => {
    const response = await api.put(`/payments/${paymentId}/confirm`, {
      action,
      notes,
    })
    return response.data
  },

  // ✅ BARU: upload bukti transfer (tamu)
  uploadProof: async (paymentId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/payments/${paymentId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  redirectToPayment: (paymentUrl) => {
    window.location.href = paymentUrl
  },
}

export default paymentsService