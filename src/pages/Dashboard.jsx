import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingsService } from '@services'
import { useAuth } from '@context/AuthContext'
import { formatPrice, formatDate, getStatusColor, getStatusText } from '@utils/formatters'
import { Loading } from '@components/common'
import { toast } from 'react-toastify'
import { FiCalendar, FiUser, FiHome } from 'react-icons/fi'

function Dashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getUserBookings()
      setBookings(data)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      await bookingsService.cancelBooking(bookingId)
      toast.success('Booking cancelled successfully')
      loadBookings()
    } catch (error) {
      toast.error('Failed to cancel booking')
    }
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FiCalendar className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {bookings.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiHome className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Account Status</p>
                <p className="text-3xl font-bold text-gray-900">{user?.role}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">My Bookings</h2>
            <Link to="/rooms" className="btn btn-primary">
              Book New Room
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-display font-bold text-lg">{booking.room?.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-gray-600 text-sm">
                        <p>Booking Code: <span className="font-mono font-bold">{booking.booking_code}</span></p>
                        <p>Check-in: {formatDate(booking.check_in)}</p>
                        <p>Check-out: {formatDate(booking.check_out)}</p>
                        <p>Guests: {booking.guests}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600 mb-4">
                        {formatPrice(booking.total_price)}
                      </p>
                      <div className="flex flex-col space-y-2">
                        {booking.status === 'pending' && (
                          <Link
                            to={`/payment/${booking.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            Pay Now
                          </Link>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link to="/rooms" className="btn btn-primary">
                Browse Rooms
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard