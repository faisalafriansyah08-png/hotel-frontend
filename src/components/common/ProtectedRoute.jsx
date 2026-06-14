import { Navigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Kalau ada role restriction, cek role user
  if (roles && !roles.includes(user?.role)) {
    // Arahkan ke halaman yang sesuai rolenya
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'staff') return <Navigate to="/staff" replace />
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute