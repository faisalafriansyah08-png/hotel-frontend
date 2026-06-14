import { useEffect, useState } from 'react'
import { bookingsService, paymentsService, roomsService } from '@services'
import { formatPrice, formatDate, getStatusColor, getStatusText } from '@utils/formatters'
import { FiCalendar, FiDollarSign, FiHome, FiUser, FiArrowRight, FiLogIn, FiLogOut, FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function StaffDashboard() {
  const [pendingPayments, setPendingPayments] = useState([])
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    Promise.all([
      paymentsService.getPendingConfirmations().catch(() => []),
      bookingsService.getUserBookings().catch(() => []),
      roomsService.getRooms().catch(() => []),
    ]).then(([payments, bkgs, rms]) => {
      setPendingPayments(payments)
      setBookings(bkgs)
      setRooms(rms)
    }).finally(() => setLoading(false))
  }, [])

  const checkInsToday = bookings.filter(b => b.check_in === today && b.status === 'confirmed')
  const checkOutsToday = bookings.filter(b => b.check_out === today && b.status === 'checked_in')
  const ongoingStay = bookings.filter(b => b.status === 'checked_in')
  const availableRooms = rooms.filter(r => r.status === 'available')
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance')

  // Jam sekarang untuk info shift
  const hour = new Date().getHours()
  const shift = hour >= 6 && hour < 14 ? 'Pagi (06.00–14.00)'
    : hour >= 14 && hour < 22 ? 'Siang (14.00–22.00)'
    : 'Malam (22.00–06.00)'

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Resepsionis</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
          <FiClock size={15} />
          Shift {shift}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiLogIn size={20} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Check-in Hari Ini"
          value={checkInsToday.length}
          sub={`${checkInsToday.length} tamu akan tiba`}
        />
        <StatCard
          icon={<FiLogOut size={20} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Check-out Hari Ini"
          value={checkOutsToday.length}
          sub={`${checkOutsToday.length} tamu akan pergi`}
        />
        <StatCard
          icon={<FiUser size={20} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Sedang Menginap"
          value={ongoingStay.length}
          sub="tamu aktif"
        />
        <StatCard
          icon={<FiDollarSign size={20} />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          label="Konfirmasi Payment"
          value={pendingPayments.length}
          sub="menunggu verifikasi"
          urgent={pendingPayments.length > 0}
        />
      </div>

      {/* Room Status Strip */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiHome size={16} className="text-gray-400" />
            Status Kamar
          </h2>
          <Link to="/staff/room-status" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Update status <FiArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{availableRooms.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tersedia</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{ongoingStay.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Terisi</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{maintenanceRooms.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Maintenance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in hari ini */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiLogIn size={16} className="text-green-500" />
              Check-in Hari Ini
            </h2>
            <Link to="/staff/rooms" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <FiArrowRight size={12} />
            </Link>
          </div>
          {checkInsToday.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Tidak ada check-in hari ini</p>
          ) : (
            <div className="space-y-3">
              {checkInsToday.slice(0, 4).map(b => (
                <BookingRow key={b.id} booking={b} />
              ))}
              {checkInsToday.length > 4 && (
                <p className="text-xs text-gray-400 text-center">+{checkInsToday.length - 4} lainnya</p>
              )}
            </div>
          )}
        </div>

        {/* Check-out hari ini */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiLogOut size={16} className="text-orange-500" />
              Check-out Hari Ini
            </h2>
            <Link to="/staff/rooms" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Lihat semua <FiArrowRight size={12} />
            </Link>
          </div>
          {checkOutsToday.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Tidak ada check-out hari ini</p>
          ) : (
            <div className="space-y-3">
              {checkOutsToday.slice(0, 4).map(b => (
                <BookingRow key={b.id} booking={b} showCheckout />
              ))}
              {checkOutsToday.length > 4 && (
                <p className="text-xs text-gray-400 text-center">+{checkOutsToday.length - 4} lainnya</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending payments */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FiDollarSign size={16} className="text-yellow-500" />
              Menunggu Konfirmasi Payment
              <span className="ml-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {pendingPayments.length}
              </span>
            </h2>
            <Link to="/staff/payment-confirmation" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Konfirmasi sekarang <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingPayments.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.booking?.booking_code || `PAY-${p.id}`}</p>
                  <p className="text-xs text-gray-400">{p.booking?.user?.name || '—'}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatPrice(p.amount || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, iconBg, iconColor, label, value, sub, urgent }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 ${urgent ? 'border border-yellow-300' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        {urgent && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-3">{value}</p>
      <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function BookingRow({ booking, showCheckout }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
        <FiUser size={14} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{booking.user?.name || '—'}</p>
        <p className="text-xs text-gray-400 truncate">{booking.room?.name || booking.booking_code}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(booking.status)}`}>
          {getStatusText(booking.status)}
        </span>
        <p className="text-xs text-gray-400 mt-0.5">{booking.guests} tamu</p>
      </div>
    </div>
  )
}

export default StaffDashboard