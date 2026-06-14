import { useEffect, useState } from 'react'
import { bookingsService } from '@services'
import { toast } from 'react-toastify'
import { formatPrice, formatDate, getStatusColor, getStatusText } from '@utils/formatters'
import { FiFilter, FiUser, FiHome } from 'react-icons/fi'

function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getUserBookings()
      setBookings(data)
    } catch {
      toast.error('Gagal memuat data booking')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingsService.updateBookingStatus(bookingId, newStatus)
      toast.success('Status booking diperbarui')
      loadBookings()
    } catch {
      toast.error('Gagal update status')
    }
  }

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  if (loading) return <div className="text-center py-12">Memuat...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Kelola Booking</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-4">
        <FiFilter className="text-gray-500" />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="all">Semua Booking</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="text-sm text-gray-500">{filteredBookings.length} booking</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Kode', 'Tamu', 'Kamar', 'Check-in', 'Check-out', 'Total', 'Status', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">Tidak ada data</td>
              </tr>
            ) : filteredBookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{booking.booking_code}</td>

                {/* Tamu */}
                <td className="px-4 py-3">
                  {booking.user ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiUser size={13} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{booking.user.name}</p>
                        <p className="text-xs text-gray-400">{booking.user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                </td>

                {/* Kamar */}
                <td className="px-4 py-3">
                  {booking.room ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiHome size={13} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{booking.room.name}</p>
                        <p className="text-xs text-gray-400">{booking.room.code}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(booking.check_in)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(booking.check_out)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatPrice(booking.total_price)}</td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <select
                    value={booking.status}
                    onChange={e => handleUpdateStatus(booking.id, e.target.value)}
                    disabled={['completed', 'cancelled'].includes(booking.status)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BookingManagement