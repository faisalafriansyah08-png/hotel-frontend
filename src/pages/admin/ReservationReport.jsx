import { useEffect, useState } from 'react'
import { bookingsService } from '@services'
import { formatPrice } from '@utils/formatters'
import { toast } from 'react-toastify'
import { FiDownload, FiFilter, FiRefreshCw } from 'react-icons/fi'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function ReservationReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    status: '',
  })

  useEffect(() => { loadReport() }, [])

  const loadReport = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (filters.status) params.status = filters.status
      const result = await bookingsService.getReport(params)
      setData(result)
    } catch {
      toast.error('Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleExportCSV = () => {
    if (!data?.bookings?.length) return

    const headers = [
      'Kode Booking', 'Nama Tamu', 'Email', 'Kamar', 'Check-in',
      'Check-out', 'Tamu', 'Total Harga', 'Diskon', 'Kode Promo', 'Status', 'Tanggal Pesan'
    ]

    const rows = data.bookings.map(b => [
      b.booking_code,
      b.guest_name,
      b.guest_email,
      `${b.room_name} (${b.room_code})`,
      b.check_in,
      b.check_out,
      b.guests,
      b.total_price,
      b.discount_amount,
      b.promo_code || '-',
      b.status,
      b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-',
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-reservasi-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Laporan Reservasi</h1>
        <button
          onClick={handleExportCSV}
          disabled={!data?.bookings?.length}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors"
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium">
          <FiFilter size={16} />
          <span>Filter</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input text-sm"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReport}
              disabled={loading}
              className="flex items-center gap-2 w-full justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Tampilkan'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-1">Total Reservasi</p>
              <p className="text-2xl font-bold text-gray-800">{data.summary.total_bookings}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(data.summary.total_revenue)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.summary.status_counts?.confirmed || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-xs text-gray-500 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-500">
                {data.summary.status_counts?.cancelled || 0}
              </p>
            </div>
          </div>

          {/* Tabel */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Kode', 'Tamu', 'Kamar', 'Check-in', 'Check-out', 'Total', 'Status', 'Tanggal Pesan'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center text-gray-400">
                        Tidak ada data reservasi
                      </td>
                    </tr>
                  ) : (
                    data.bookings.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs font-medium">{b.booking_code}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{b.guest_name}</div>
                          <div className="text-xs text-gray-400">{b.guest_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{b.room_name}</div>
                          <div className="text-xs text-gray-400 font-mono">{b.room_code}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(b.check_in).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(b.check_out).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold">
                          {formatPrice(b.total_price)}
                          {b.discount_amount > 0 && (
                            <div className="text-xs text-green-600 font-normal">
                              -{formatPrice(b.discount_amount)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ReservationReport