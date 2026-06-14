import { useEffect, useState } from 'react'
import { promosService } from '@services'
import { Modal, Loading, Button } from '@components/common'
import { toast } from 'react-toastify'
import { FiEdit, FiTrash2, FiPlus, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { formatDate } from '@utils/formatters'

function PromoManagement() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount_percent: '',
    discount_amount: '',
    min_transaction: '0',
    max_discount: '',
    start_date: '',
    end_date: '',
    usage_limit: '',
    active: true
  })

  useEffect(() => {
    loadPromos()
  }, [])

  const loadPromos = async () => {
    try {
      const data = await promosService.getActivePromos()
      setPromos(data)
    } catch (error) {
      toast.error('Failed to load promos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo)
      setFormData({
        title: promo.title,
        code: promo.code,
        discount_percent: promo.discount_percent || '',
        discount_amount: promo.discount_amount || '',
        min_transaction: promo.min_transaction || '0',
        max_discount: promo.max_discount || '',
        start_date: promo.start_date,
        end_date: promo.end_date,
        usage_limit: promo.usage_limit || '',
        active: promo.active
      })
    } else {
      setEditingPromo(null)
      setFormData({
        title: '',
        code: '',
        discount_percent: '',
        discount_amount: '',
        min_transaction: '0',
        max_discount: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        active: true
      })
    }
    setShowModal(true)
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      title: formData.title,
      code: formData.code,
      discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
      discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
      min_transaction: parseFloat(formData.min_transaction),
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      active: formData.active
    }

    try {
      if (editingPromo) {
        await promosService.updatePromo(editingPromo.id, payload)
        toast.success('Promo updated successfully')
      } else {
        await promosService.createPromo(payload)
        toast.success('Promo created successfully')
      }
      setShowModal(false)
      loadPromos()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promo?')) return

    try {
      await promosService.deletePromo(id)
      toast.success('Promo deleted successfully')
      loadPromos()
    } catch (error) {
      toast.error('Failed to delete promo')
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Promo Management</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
          <FiPlus />
          <span>Add Promo</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map(promo => (
          <div key={promo.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {promo.discount_percent ? `${promo.discount_percent}%` : `Rp ${promo.discount_amount?.toLocaleString()}`}
                </span>
                {promo.active ? (
                  <FiToggleRight className="text-green-300" size={32} />
                ) : (
                  <FiToggleLeft className="text-gray-300" size={32} />
                )}
              </div>
              <h3 className="font-bold text-lg">{promo.title}</h3>
              <p className="text-sm text-primary-100">Code: {promo.code}</p>
            </div>

            <div className="p-4">
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>• Min: Rp {promo.min_transaction?.toLocaleString()}</p>
                {promo.max_discount && <p>• Max discount: Rp {promo.max_discount.toLocaleString()}</p>}
                <p>• Valid: {formatDate(promo.start_date)} - {formatDate(promo.end_date)}</p>
                {promo.usage_limit && <p>• Usage: {promo.usage_count}/{promo.usage_limit}</p>}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(promo)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <FiEdit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <FiTrash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPromo ? 'Edit Promo' : 'Add New Promo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Promo Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Promo Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="input uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Discount Type</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleChange}
                  placeholder="Percent %"
                  className="input"
                />
                <input
                  type="number"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleChange}
                  placeholder="Amount Rp"
                  className="input"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Fill one: either percent OR amount</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Transaction (Rp)</label>
              <input
                type="number"
                name="min_transaction"
                value={formData.min_transaction}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Discount (Rp)</label>
              <input
                type="number"
                name="max_discount"
                value={formData.max_discount}
                onChange={handleChange}
                className="input"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Usage Limit</label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleChange}
                className="input"
                placeholder="Unlimited if empty"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" variant="primary" className="flex-1">
              {editingPromo ? 'Update' : 'Create'} Promo
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PromoManagement