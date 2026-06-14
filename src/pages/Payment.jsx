import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { paymentsService, bookingsService } from '@services'
import { formatPrice } from '@utils/formatters'
import { toast } from 'react-toastify'
import { FiCreditCard, FiCheck, FiUpload, FiUser, FiPhone, FiMail, FiFileText } from 'react-icons/fi'
import { Loading } from '@components/common'

function Payment() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(location.state?.booking)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(!booking)
  const [processing, setProcessing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [uploadDone, setUploadDone] = useState(false)

  // Form data diri
  const [guestData, setGuestData] = useState({
    full_name: '',
    phone: '',
    email: '',
    id_number: '',   // No KTP/Paspor
    special_request: '',
  })

  useEffect(() => {
    if (!booking && bookingId) loadBooking()
  }, [bookingId, booking])

  const loadBooking = async () => {
    try {
      const data = await bookingsService.getBookingByCode(bookingId)
      setBooking(data)
    } catch {
      toast.error('Booking not found')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestChange = (e) => {
    setGuestData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Hanya file JPG/PNG yang diizinkan')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const handlePayment = async (gateway) => {
    if (!guestData.full_name || !guestData.phone || !guestData.id_number) {
      toast.error('Lengkapi data diri terlebih dahulu')
      return
    }
    setProcessing(true)
    try {
      const paymentData = await paymentsService.createPayment(booking.id, gateway)
      setPayment(paymentData)
      toast.success('Pembayaran berhasil dibuat!')
    } catch {
      toast.error('Gagal memproses pembayaran')
    } finally {
      setProcessing(false)
    }
  }

  const handleUploadProof = async () => {
    if (!proofFile) {
      toast.error('Pilih file bukti transfer terlebih dahulu')
      return
    }
    setUploading(true)
    try {
      await paymentsService.uploadProof(payment.id, proofFile)
      setUploadDone(true)
      toast.success('Bukti transfer berhasil diunggah! Menunggu konfirmasi staff.')
    } catch {
      toast.error('Gagal mengunggah bukti transfer')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <Loading fullScreen />
  if (!booking) return null

  return (
    <div className="py-8">
      <div className="container-custom max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-8">Pembayaran</h1>

        {/* Booking Summary */}
        <div className="card p-6 mb-6">
          <h3 className="font-display font-bold text-lg mb-4">Ringkasan Booking</h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Kode Booking:</span>
              <span className="font-mono font-bold">{booking.booking_code}</span>
            </div>
            <div className="flex justify-between">
              <span>Kamar:</span>
              <span className="font-medium">{booking.room?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-in:</span>
              <span>{new Date(booking.check_in).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-out:</span>
              <span>{new Date(booking.check_out).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Tamu:</span>
              <span>{booking.guests} orang</span>
            </div>
            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon:</span>
                <span>-{formatPrice(booking.discount_amount)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary-600">{formatPrice(booking.total_price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Form Data Diri */}
        {!payment && (
          <div className="card p-6 mb-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <FiUser className="text-primary-600" />
              Data Diri Tamu
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={guestData.full_name}
                    onChange={handleGuestChange}
                    placeholder="Nama sesuai KTP"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={guestData.phone}
                      onChange={handleGuestChange}
                      placeholder="08xxxxxxxxxx"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={guestData.email}
                      onChange={handleGuestChange}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. KTP / Paspor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="id_number"
                    value={guestData.id_number}
                    onChange={handleGuestChange}
                    placeholder="Nomor identitas"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permintaan Khusus
                </label>
                <textarea
                  name="special_request"
                  value={guestData.special_request}
                  onChange={handleGuestChange}
                  placeholder="Contoh: kamar di lantai atas, extra bed, dll."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pilih Metode Pembayaran */}
        {!payment && (
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg mb-4">Metode Pembayaran</h3>
            <div className="space-y-3">
              <button
                onClick={() => handlePayment('xendit')}
                disabled={processing}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <FiCreditCard size={22} className="text-primary-600" />
                  <div className="text-left">
                    <div className="font-semibold">Xendit</div>
                    <div className="text-xs text-gray-500">Kartu kredit, E-wallet, VA</div>
                  </div>
                </div>
                <FiCheck className="text-primary-600" />
              </button>

              <button
                onClick={() => handlePayment('midtrans')}
                disabled={processing}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <FiCreditCard size={22} className="text-primary-600" />
                  <div className="text-left">
                    <div className="font-semibold">Midtrans</div>
                    <div className="text-xs text-gray-500">Berbagai metode pembayaran</div>
                  </div>
                </div>
                <FiCheck className="text-primary-600" />
              </button>

              {/* Transfer Manual */}
              <button
                onClick={() => handlePayment('manual')}
                disabled={processing}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <FiUpload size={22} className="text-primary-600" />
                  <div className="text-left">
                    <div className="font-semibold">Transfer Manual</div>
                    <div className="text-xs text-gray-500">BCA / BRI / Mandiri + upload bukti</div>
                  </div>
                </div>
                <FiCheck className="text-primary-600" />
              </button>
            </div>

            {processing && (
              <div className="mt-4 text-center text-gray-500 text-sm">
                Memproses pembayaran...
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Upload Bukti Transfer */}
        {payment && !uploadDone && (
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiUpload className="text-blue-600" size={26} />
              </div>
              <h3 className="font-display font-bold text-xl">Upload Bukti Pembayaran</h3>
              <p className="text-gray-500 text-sm mt-1">
                Transfer ke rekening hotel lalu upload bukti di bawah ini
              </p>
            </div>

            {/* Info rekening */}
            <div className="bg-blue-50 rounded-lg p-4 mb-5 text-sm">
              <p className="font-semibold text-blue-800 mb-2">Info Rekening Hotel:</p>
              <p className="text-blue-700">BCA: <strong>1234567890</strong> a.n. DNDRA HOTEL</p>
              <p className="text-blue-700">BRI: <strong>0987654321</strong> a.n. DNDRA HOTEL</p>
              <p className="text-blue-600 mt-2">
                Nominal: <strong>{formatPrice(booking.total_price)}</strong>
              </p>
            </div>

            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                proofPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400'
              }`}
              onClick={() => document.getElementById('proof-input').click()}
            >
              {proofPreview ? (
                <div>
                  <img
                    src={proofPreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain mb-2"
                  />
                  <p className="text-sm text-green-600 font-medium">{proofFile?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk ganti foto</p>
                </div>
              ) : (
                <div>
                  <FiUpload size={32} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Klik untuk upload foto bukti transfer</p>
                  <p className="text-xs text-gray-400 mt-1">JPG atau PNG, maks. 5MB</p>
                </div>
              )}
              <input
                id="proof-input"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <button
              onClick={handleUploadProof}
              disabled={!proofFile || uploading}
              className="w-full mt-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
            </button>
          </div>
        )}

        {/* STEP 4: Selesai */}
        {uploadDone && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600" size={32} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Bukti Berhasil Dikirim!</h3>
            <p className="text-gray-500 mb-6">
              Staff kami akan memverifikasi pembayaran Anda dalam 1x24 jam.
              Notifikasi akan dikirim ke email Anda.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              Lihat Status Booking
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payment