import { useEffect, useState } from 'react'
import { paymentsService } from '@services'
import { toast } from 'react-toastify'
import { FiCheck, FiX, FiEye } from 'react-icons/fi'
import { formatPrice } from '@utils/formatters'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '')

function PaymentConfirmation() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState({})
  const [processing, setProcessing] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => { loadPending() }, [])

  const loadPending = async () => {
    try {
      const data = await paymentsService.getPendingConfirmations()
      setPayments(data)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (paymentId, action) => {
    setProcessing(paymentId)
    try {
      await paymentsService.confirmPayment(paymentId, action, notes[paymentId] || '')
      toast.success(action === 'approve' ? 'Pembayaran dikonfirmasi!' : 'Pembayaran ditolak')
      loadPending()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal memproses')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <div className="text-center py-12">Memuat...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Konfirmasi Pembayaran</h1>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          Tidak ada pembayaran yang menunggu konfirmasi
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">

                {/* Bukti transfer */}
                <div className="flex-shrink-0">
                  {payment.proof_image ? (
                    <div className="relative">
                      <img
                        src={`${API_BASE}${payment.proof_image}`}
                        alt="Bukti Transfer"
                        className="w-40 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                        onClick={() => setPreviewImage(`${API_BASE}${payment.proof_image}`)}
                      />
                      <button
                        onClick={() => setPreviewImage(`${API_BASE}${payment.proof_image}`)}
                        className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white rounded p-1"
                      >
                        <FiEye size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      Tidak ada bukti
                    </div>
                  )}
                </div>

                {/* Info pembayaran */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">Payment #{payment.id}</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                      Menunggu Konfirmasi
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                    <div>Booking ID: <span className="font-medium text-gray-800">#{payment.booking_id}</span></div>
                    <div>Jumlah: <span className="font-bold text-gray-800">{formatPrice(payment.amount)}</span></div>
                    <div>Metode: <span className="font-medium text-gray-800 uppercase">{payment.gateway}</span></div>
                    <div>Ref: <span className="font-mono text-gray-800">{payment.transaction_ref}</span></div>
                    <div>Tanggal: <span className="font-medium text-gray-800">
                      {new Date(payment.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span></div>
                  </div>

                  {/* Catatan */}
                  <textarea
                    placeholder="Catatan (opsional)..."
                    value={notes[payment.id] || ''}
                    onChange={e => setNotes(prev => ({ ...prev, [payment.id]: e.target.value }))}
                    rows={2}
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />

                  {/* Tombol aksi */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => handleAction(payment.id, 'approve')}
                      disabled={processing === payment.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <FiCheck size={16} />
                      {processing === payment.id ? 'Memproses...' : 'Konfirmasi'}
                    </button>
                    <button
                      onClick={() => handleAction(payment.id, 'reject')}
                      disabled={processing === payment.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <FiX size={16} />
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal preview gambar */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full">
            <img src={previewImage} alt="Bukti Transfer" className="w-full rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentConfirmation