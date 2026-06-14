import { useEffect, useState } from 'react'
import { roomsService } from '@services'
import { toast } from 'react-toastify'
import { FiHome, FiTool, FiCheckCircle, FiRefreshCw, FiUsers, FiLock } from 'react-icons/fi'

// Staff hanya bisa toggle antara available dan maintenance
// disabled = urusan admin, tidak ditampilkan sebagai opsi toggle
const STATUS_META = {
  available: {
    label: 'Tersedia',
    sublabel: 'Bisa dipesan & ditempati',
    icon: FiCheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  maintenance: {
    label: 'Tidak Tersedia',
    sublabel: 'Tidak bisa dipesan',
    icon: FiTool,
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  disabled: {
    label: 'Dinonaktifkan',
    sublabel: 'Dikelola oleh admin',
    icon: FiLock,
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
  },
}

function RoomStatusUpdate() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadRooms() }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const data = await roomsService.getAllRooms()
      setRooms(data)
    } catch {
      toast.error('Gagal memuat data kamar')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (room) => {
    // Kamar disabled tidak bisa diubah staff
    if (room.status === 'disabled') {
      toast.warning('Kamar ini dinonaktifkan oleh admin, tidak bisa diubah')
      return
    }
    if (updating) return

    const newStatus = room.status === 'available' ? 'maintenance' : 'available'
    const newLabel = newStatus === 'available' ? 'Tersedia' : 'Tidak Tersedia'

    setUpdating(room.id)
    try {
      await roomsService.updateRoom(room.id, { status: newStatus })
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r))
      toast.success(`${room.name} → ${newLabel}`)
    } catch {
      toast.error('Gagal mengubah status kamar')
    } finally {
      setUpdating(null)
    }
  }

  const getMeta = (status) => STATUS_META[status] || STATUS_META.available

  const filtered = rooms.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Update Status Kamar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tandai kamar tersedia atau tidak tersedia untuk tamu</p>
        </div>
        <button
          onClick={loadRooms}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 transition-colors"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary strip — hanya 3 kartu: Semua, Tersedia, Tidak Tersedia */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { key: 'all', label: 'Semua Kamar', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
          { key: 'available', label: 'Tersedia', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { key: 'maintenance', label: 'Tidak Tersedia', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`rounded-xl border p-4 text-center transition-all ${item.bg} ${
              filterStatus === item.key ? 'ring-2 ring-blue-400 ring-offset-1' : 'hover:opacity-80'
            }`}
          >
            <p className={`text-2xl font-bold ${item.color}`}>{counts[item.key] ?? rooms.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <input
          type="text"
          placeholder="Cari nama atau kode kamar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Room Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          Tidak ada kamar ditemukan
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(room => {
            const meta = getMeta(room.status)
            const isUpdating = updating === room.id
            const isDisabled = room.status === 'disabled'

            return (
              <div
                key={room.id}
                className={`bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4 ${isDisabled ? 'opacity-60' : ''}`}
              >
                {/* Nama & kode */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiHome size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 leading-tight">{room.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{room.code}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.bg} ${meta.border} ${meta.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1">
                    <FiUsers size={11} />
                    {room.capacity} orang
                  </span>
                  <span>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(room.price)}/malam
                  </span>
                </div>

                {/* Sublabel status */}
                <p className={`text-xs font-medium ${meta.text}`}>
                  {meta.sublabel}
                </p>

                {/* Toggle button */}
                {isDisabled ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-400">
                    <FiLock size={12} />
                    Hanya admin yang bisa mengubah
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleStatus(room)}
                    disabled={isUpdating}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${room.status === 'available'
                        ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      }`}
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : room.status === 'available' ? (
                      <>
                        <FiTool size={14} />
                        Tandai Tidak Tersedia
                      </>
                    ) : (
                      <>
                        <FiCheckCircle size={14} />
                        Tandai Tersedia
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RoomStatusUpdate