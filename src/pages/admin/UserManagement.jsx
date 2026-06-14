import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '@services/api'
import { FiUser, FiTrash2, FiEdit2, FiX, FiCheck, FiSearch } from 'react-icons/fi'

const ROLES = ['user', 'staff', 'admin']

const roleColor = (role) => ({
  admin: 'bg-red-100 text-red-700',
  staff: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
}[role] || 'bg-gray-100 text-gray-600')

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch {
      toast.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditId(user.id)
    setEditData({ name: user.name, phone: user.phone || '', role: user.role })
  }

  const handleSave = async (userId) => {
    try {
      await api.put(`/users/${userId}`, editData)
      toast.success('User berhasil diperbarui')
      setEditId(null)
      loadUsers()
    } catch {
      toast.error('Gagal memperbarui user')
    }
  }

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`)
      toast.success('User berhasil dihapus')
      setDeleteConfirm(null)
      loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menghapus user')
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center py-12">Memuat...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Kelola Akun User</h1>
        <span className="text-sm text-gray-500">{users.length} user terdaftar</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['#', 'Nama', 'Email', 'No. HP', 'Role', 'Aksi'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">Tidak ada user ditemukan</td>
              </tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">{user.id}</td>

                {/* Nama */}
                <td className="px-4 py-3">
                  {editId === user.id ? (
                    <input
                      value={editData.name}
                      onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiUser size={13} className="text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{user.name}</span>
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>

                {/* No HP */}
                <td className="px-4 py-3">
                  {editId === user.id ? (
                    <input
                      value={editData.phone}
                      onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      placeholder="08xxx"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">{user.phone || '—'}</span>
                  )}
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  {editId === user.id ? (
                    <select
                      value={editData.role}
                      onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                  )}
                </td>

                {/* Aksi */}
                <td className="px-4 py-3">
                  {editId === user.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(user.id)}
                        className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Simpan"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        title="Batal"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Hapus"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal konfirmasi hapus */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-lg mb-2">Hapus User?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Aksi ini tidak bisa dibatalkan. Semua data booking terkait user ini juga akan terpengaruh.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 text-sm"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement