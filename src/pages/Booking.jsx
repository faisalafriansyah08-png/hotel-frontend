import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { bookingsService, promosService } from '@services'
import { formatPrice, calculateDays } from '@utils/formatters'
import { toast } from 'react-toastify'
import { FiTag, FiAlertCircle } from 'react-icons/fi'

function Booking() {
  const location = useLocation()
  const navigate = useNavigate()
  const { roomId, roomName, price, checkIn, checkOut } = location.state || {}

  const [formData, setFormData] = useState({
    guests: 2,
    notes: '',
    promoCode: ''
  })
  const [promoValidation, setPromoValidation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validatingPromo, setValidatingPromo] = useState(false)

  useEffect(() => {
    if (!roomId) {
      toast.error('Please select a room first')
      navigate('/rooms')
    }
  }, [roomId, navigate])

  const days = calculateDays(checkIn, checkOut)
  const basePrice = price * days
  const discount = promoValidation?.valid ? promoValidation.discount_amount : 0
  const totalPrice = basePrice - discount

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleValidatePromo = async () => {
    if (!formData.promoCode) {
      setPromoValidation(null)
      return
    }

    setValidatingPromo(true)
    try {
      const result = await promosService.validatePromo(formData.promoCode, basePrice)
      setPromoValidation(result)
      if (result.valid) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to validate promo code')
      setPromoValidation(null)
    } finally {
      setValidatingPromo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const booking = await bookingsService.createBooking({
        roomId,
        checkIn,
        checkOut,
        guests: parseInt(formData.guests),
        promoCode: promoValidation?.valid ? formData.promoCode : null,
        notes: formData.notes
      })

      toast.success('Booking created successfully!')
      navigate(`/payment/${booking.id}`, { state: { booking } })
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="font-display text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
              {/* Room Info */}
              <div className="pb-6 border-b">
                <h3 className="font-display font-bold text-lg mb-2">{roomName}</h3>
                <div className="text-gray-600 space-y-1">
                  <p>Check-in: {new Date(checkIn).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(checkOut).toLocaleDateString()}</p>
                  <p>{days} night{days > 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Guest Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              {/* Promo Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleChange}
                    placeholder="Enter promo code"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleValidatePromo}
                    disabled={validatingPromo || !formData.promoCode}
                    className="btn btn-secondary"
                  >
                    {validatingPromo ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {promoValidation && (
                  <div className={`mt-2 p-3 rounded-lg flex items-start space-x-2 ${
                    promoValidation.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{promoValidation.message}</span>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g., Early check-in, high floor, extra pillows..."
                  className="input"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-4">Price Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{formatPrice(price)} × {days} nights</span>
                  <span>{formatPrice(basePrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center space-x-1">
                      <FiTag size={16} />
                      <span>Discount</span>
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                * Taxes and fees included
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Booking