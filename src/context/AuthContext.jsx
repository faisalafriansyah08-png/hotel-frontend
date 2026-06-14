import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '@services/auth'

const AuthContext = createContext(null)

// Helper: tentukan storage berdasarkan role atau path
const getStorage = (role) => {
  if (role === 'admin' || role === 'staff') return sessionStorage
  return localStorage
}

const getStoredToken = () => {
  // Cek sessionStorage dulu (admin/staff), lalu localStorage (tamu)
  return sessionStorage.getItem('token') || localStorage.getItem('token')
}

const setStoredToken = (token, role) => {
  if (role === 'admin' || role === 'staff') {
    sessionStorage.setItem('token', token)
    localStorage.removeItem('token') // pastikan tidak bentrok
  } else {
    localStorage.setItem('token', token)
    sessionStorage.removeItem('token')
  }
}

const removeStoredToken = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(getStoredToken)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getStoredToken()
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser(storedToken)
          setUser(userData)
          setToken(storedToken)
        } catch {
          removeStoredToken()
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { access_token } = response

      // Dapatkan data user dulu untuk tahu rolenya
      const userData = await authService.getCurrentUser(access_token)

      // Simpan token di storage yang tepat berdasarkan role
      setStoredToken(access_token, userData.role)
      setToken(access_token)
      setUser(userData)

      return { success: true, user: userData }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      }
    }
  }

  const register = async (name, email, password, phone) => {
    try {
      await authService.register(name, email, password, phone)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      }
    }
  }

  const logout = () => {
    removeStoredToken()
    setToken(null)
    setUser(null)
    navigate('/')
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}