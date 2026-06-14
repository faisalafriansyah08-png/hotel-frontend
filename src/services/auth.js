import api from './api'

const authService = {
  // Register new user
  register: async (name, email, password, phone) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      phone,
    })
    return response.data
  },

  // Login user
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email) // Backend expects 'username' field
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data // { access_token, token_type }
  },

  // Get current user info
  getCurrentUser: async (token) => {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token')
  },
}

export default authService
