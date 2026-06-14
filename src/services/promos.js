import api from './api'

const promosService = {
  // Get all active promos
  getActivePromos: async () => {
    const response = await api.get('/promos', {
      params: { active_only: true },
    })
    return response.data
  },

  // Validate promo code
  validatePromo: async (code, totalAmount) => {
    const response = await api.post('/promos/validate', {
      code: code,
      total_amount: totalAmount,
    })
    return response.data
  },

  // Get promo by ID
  getPromoById: async (id) => {
    const response = await api.get(`/promos/${id}`)
    return response.data
  },

  // Admin: Create promo
  createPromo: async (promoData) => {
    const response = await api.post('/promos', promoData)
    return response.data
  },

  // Admin: Update promo
  updatePromo: async (id, promoData) => {
    const response = await api.put(`/promos/${id}`, promoData)
    return response.data
  },

  // Admin: Delete promo
  deletePromo: async (id) => {
    const response = await api.delete(`/promos/${id}`)
    return response.data
  },
}

export default promosService
