import api from './api'

const bookingsService = {
  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', {
      room_id: bookingData.roomId,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      guests: bookingData.guests,
      promo_code: bookingData.promoCode || null,
      notes: bookingData.notes || null,
    })
    return response.data
  },

  // Get all user bookings
  getUserBookings: async () => {
    const response = await api.get('/bookings/')
    return response.data
  },

  // Get booking by code
  getBookingByCode: async (bookingCode) => {
    const response = await api.get(`/bookings/${bookingCode}`)
    return response.data
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`)
    return response.data
  },

  // Admin: Update booking status
  updateBookingStatus: async (bookingId, status, notes) => {
    const response = await api.put(`/bookings/${bookingId}`, {
      status,
      notes,
    })
    return response.data
  },

  // Calculate booking price
  calculatePrice: async (roomId, checkIn, checkOut, promoCode) => {
    try {
      // This is a helper function to calculate price before booking
      const room = await api.get(`/rooms/${roomId}`)
      const days = Math.ceil(
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
      )
      const basePrice = room.data.price * days

      let discount = 0
      if (promoCode) {
        const promoResponse = await api.post('/promos/validate', {
          code: promoCode,
          total_amount: basePrice,
        })
        if (promoResponse.data.valid) {
          discount = promoResponse.data.discount_amount
        }
      }

      return {
        basePrice,
        discount,
        totalPrice: basePrice - discount,
        days,
      }
    } catch (error) {
      throw error
    }
  },
  // Admin: Laporan reservasi
    getReport: async (params = {}) => {
      const response = await api.get('/bookings/report/summary', { params })
      return response.data
    },
}

export default bookingsService
