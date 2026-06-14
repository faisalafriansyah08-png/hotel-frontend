import { useEffect, useState } from 'react'
import { bookingsService, roomsService, promosService, supportService } from '@services'
import { Loading } from '@components/common'
import { FiCalendar, FiHome, FiTag, FiMessageSquare, FiTrendingUp } from 'react-icons/fi'
import { formatPrice } from '@utils/formatters'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRooms: 0,
    activePromos: 0,
    openTickets: 0,
    totalRevenue: 0,
    recentBookings: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [bookings, rooms, promos, tickets] = await Promise.all([
        bookingsService.getUserBookings(), // Admin sees all
        roomsService.getRooms(),
        promosService.getActivePromos(),
        supportService.getMyTickets()
      ])

      const revenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.total_price), 0)

      setStats({
        totalBookings: bookings.length,
        totalRooms: rooms.length,
        activePromos: promos.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        totalRevenue: revenue,
        recentBookings: bookings.slice(0, 5)
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRooms}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiHome className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Promos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activePromos}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTag className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Open Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openTickets}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm mb-2">Total Revenue</p>
            <p className="text-4xl font-bold">{formatPrice(stats.totalRevenue)}</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <FiTrendingUp size={32} />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        {stats.recentBookings.length > 0 ? (
          <div className="space-y-3">
            {stats.recentBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold">{booking.booking_code}</p>
                  <p className="text-sm text-gray-600">{booking.room?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">{formatPrice(booking.total_price)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No bookings yet</p>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard