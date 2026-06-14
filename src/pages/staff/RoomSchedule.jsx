import { useEffect, useState } from 'react'
import { bookingsService } from '@services'
import { toast } from 'react-toastify'
import { formatDate, getStatusColor, getStatusText } from '@utils/formatters'
import { FiCalendar, FiUser, FiHome, FiSearch } from 'react-icons/fi'

function RoomSchedule() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getUserBookings()
      // Staff hanya perlu lihat yang aktif
      const active = data.filter(b =>
        ['pending', 'confirmed', 'checked_in'].includes(b.status)
      )
      setBookings(active)
    } catch {
      toast.error('Gagal memuat jadwal kamar')
    } finally {
      setLoading(false)
    }
  }

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.booking_code.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.room?.name?.toLowerCase().includes(search.toLowerCase())

    const matchDate = !filterDate ||
      b.check_in === filterDate ||
      b.check_out === filterDate

    return matchSearch && matchDate
  })

  // Group by check-in date
  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = filtered.filter(b => b.check_in === today || b.check_out === today)
  const upcomingBookings = filtered.filter(b => b.check_in > today)
  const ongoingBookings = filtered.filter(b => b.status === 'checked_in')

  if (loading) return <div className="text-center py-12">Memuat jadwal...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Jadwal Kamar</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Hari Ini', count: todayBookings.length, color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
          { label: 'Sedang Menginap', count: ongoingBookings.length, color: 'bg-green-50 text-green-700', border: 'border-green-200' },
          { label: 'Akan Datang', count: upcomingBookings.length, color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-4 border ${s.border} text-center`}>
            <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama tamu, kamar, kode booking..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-400" />
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          Tidak ada jadwal ditemukan
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col sm:flex-row gap-4">

              {/* Status bar kiri */}
              <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-center justify-start gap-2 sm:gap-1 sm:w-24 sm:text-center">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
                <p className="font-mono text-xs text-gray-400">{booking.booking_code}</p>
              </div>

              {/* Info tamu */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiUser size={15} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tamu</p>
                    <p className="font-semibold text-gray-800">
                      {booking.user?.name || <span className="text-gray-400 italic">Tidak diketahui</span>}
                    </p>
                    <p className="text-xs text-gray-400">{booking.user?.email}</p>
                    {booking.user?.phone && (
                      <p className="text-xs text-gray-400">{booking.user.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiHome size={15} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Kamar</p>
                    <p className="font-semibold text-gray-800">
                      {booking.room?.name || <span className="text-gray-400 italic">—</span>}
                    </p>
                    <p className="text-xs text-gray-400">{booking.room?.code}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                  <p className={`text-sm font-medium ${booking.check_in === today ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {formatDate(booking.check_in)}
                    {booking.check_in === today && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Hari ini</span>}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                  <p className={`text-sm font-medium ${booking.check_out === today ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
                    {formatDate(booking.check_out)}
                    {booking.check_out === today && <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Hari ini</span>}
                  </p>
                </div>
              </div>

              {/* Jumlah tamu */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-400">Tamu</p>
                <p className="font-bold text-gray-800">{booking.guests} orang</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoomSchedule