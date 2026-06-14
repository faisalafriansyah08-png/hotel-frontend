import api from './api'

const roomsService = {

  getAllRooms: async () => {
    const response = await api.get('/rooms/all')
    return response.data
  },
  // Get all rooms with filters
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params })
    return response.data
  },

  // Get room by ID
  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`)
    return response.data
  },

  // Check room availability
  checkAvailability: async (roomId, checkIn, checkOut) => {
    const response = await api.post('/rooms/check-availability', {
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOut,
    })
    return response.data
  },

  // Search rooms by date and filters
  searchRooms: async (checkIn, checkOut, minCapacity, maxPrice) => {
    const params = {
      check_in: checkIn,
      check_out: checkOut,
    }
    if (minCapacity) params.min_capacity = minCapacity
    if (maxPrice) params.max_price = maxPrice

    const response = await api.get('/rooms', { params })
    return response.data
  },

  // Admin: Create room
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData)
    return response.data
  },

  // Admin: Update room
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData)
    return response.data
  },

  // Admin: Delete room
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`)
    return response.data
  },
  // Admin: Upload gambar kamar
  uploadRoomImage: async (roomId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/rooms/${roomId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Admin: Hapus gambar kamar
  deleteRoomImage: async (roomId, imageUrl) => {
    const response = await api.delete(`/rooms/${roomId}/delete-image`, {
      params: { image_url: imageUrl }
    })
    return response.data
  },
  
}

export default roomsService

