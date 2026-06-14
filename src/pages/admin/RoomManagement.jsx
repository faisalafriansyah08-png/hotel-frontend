import { useEffect, useState } from 'react'
import { roomsService } from '@services'
import { Modal, Loading, Button } from '@components/common'
import { toast } from 'react-toastify'
import { FiEdit, FiTrash2, FiPlus, FiUpload, FiX } from 'react-icons/fi'
import { formatPrice } from '@utils/formatters'

function RoomManagement() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    code: '', name: '', description: '',
    price: '', capacity: '2', status: 'available', amenities: ''
  })

  useEffect(() => { loadRooms() }, [])

  const loadRooms = async () => {
    try {
      const data = await roomsService.getRooms({ limit: 100 })
      setRooms(data)
    } catch {
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        code: room.code, name: room.name,
        description: room.description || '',
        price: room.price, capacity: room.capacity,
        status: room.status,
        amenities: room.amenities?.join(', ') || ''
      })
    } else {
      setEditingRoom(null)
      setFormData({ code: '', name: '', description: '', price: '', capacity: '2', status: 'available', amenities: '' })
    }
    setShowModal(true)
  }

  const handleOpenImageModal = (room) => {
    setSelectedRoom(room)
    setShowImageModal(true)
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      code: formData.code, name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      status: formData.status,
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
      images: editingRoom?.images || []
    }
    try {
      if (editingRoom) {
        await roomsService.updateRoom(editingRoom.id, payload)
        toast.success('Room updated successfully')
      } else {
        await roomsService.createRoom(payload)
        toast.success('Room created successfully')
      }
      setShowModal(false)
      loadRooms()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room?')) return
    try {
      await roomsService.deleteRoom(id)
      toast.success('Room deleted successfully')
      loadRooms()
    } catch {
      toast.error('Failed to delete room')
    }
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedRoom) return
    setUploadingImage(true)
    try {
      const result = await roomsService.uploadRoomImage(selectedRoom.id, file)
      toast.success('Gambar berhasil diupload')
      // Update selectedRoom dengan images terbaru
      setSelectedRoom(prev => ({ ...prev, images: result.images }))
      loadRooms()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload gagal')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageUrl) => {
    if (!confirm('Hapus gambar ini?')) return
    try {
      const result = await roomsService.deleteRoomImage(selectedRoom.id, imageUrl)
      toast.success('Gambar dihapus')
      setSelectedRoom(prev => ({ ...prev, images: result.images }))
      loadRooms()
    } catch {
      toast.error('Gagal hapus gambar')
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Room Management</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <FiPlus /><span>Add Room</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map(room => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{room.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{room.name}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatPrice(room.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{room.capacity} guests</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleOpenImageModal(room)}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FiUpload size={14} />
                    <span>{room.images?.length || 0} foto</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.status === 'available' ? 'bg-green-100 text-green-800' :
                    room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{room.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => handleOpenModal(room)} className="text-blue-600 hover:text-blue-800">
                    <FiEdit size={18} />
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="text-red-600 hover:text-red-800">
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form Add/Edit Room */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Room'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Code</label>
              <input type="text" name="code" value={formData.code}
                onChange={handleChange} className="input" required disabled={!!editingRoom} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Room Name</label>
              <input type="text" name="name" value={formData.name}
                onChange={handleChange} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" value={formData.description}
              onChange={handleChange} rows="3" className="input" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (Rp)</label>
              <input type="number" name="price" value={formData.price}
                onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input type="number" name="capacity" value={formData.capacity}
                onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amenities (pisahkan koma)</label>
            <input type="text" name="amenities" value={formData.amenities}
              onChange={handleChange} placeholder="WiFi, TV, AC, Mini Bar" className="input" />
          </div>
          {editingRoom && (
            <p className="text-sm text-gray-500">
              💡 Untuk upload/kelola foto, klik tombol <strong>foto</strong> di tabel.
            </p>
          )}
          <div className="flex space-x-3">
            <Button type="submit" variant="primary" className="flex-1">
              {editingRoom ? 'Update' : 'Create'} Room
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Upload Gambar */}
      <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)}
        title={`Foto Kamar — ${selectedRoom?.name}`} size="lg">
        <div className="space-y-4">
          {/* Upload button */}
          <label className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <FiUpload className="text-blue-500" />
            <span className="text-blue-600 font-medium">
              {uploadingImage ? 'Mengupload...' : 'Klik untuk upload foto (jpg, png, webp)'}
            </span>
            <input type="file" accept="image/*" className="hidden"
              onChange={handleUploadImage} disabled={uploadingImage} />
          </label>

          {/* Preview gambar yang sudah ada */}
          {selectedRoom?.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedRoom.images.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border">
                  <img src={url} alt={`Room ${i + 1}`}
                    className="w-full h-36 object-cover" />
                  <button
                    onClick={() => handleDeleteImage(url)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-6">Belum ada foto untuk kamar ini.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default RoomManagement