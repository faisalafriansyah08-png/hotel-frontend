import { useEffect, useState } from 'react'
import { promosService } from '@services'
import { Loading } from '@components/common'
import { toast } from 'react-toastify'
import { FiTag, FiCopy, FiCalendar } from 'react-icons/fi'
import { formatDate } from '@utils/formatters'

function Promo() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPromos()
  }, [])

  const loadPromos = async () => {
    try {
      const data = await promosService.getActivePromos()
      setPromos(data)
    } catch (error) {
      console.error('Error loading promos:', error)
      toast.error('Failed to load promos')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Promo code "${code}" copied!`)
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">Special Promotions</h1>
          <p className="text-gray-600 text-lg">Save more with our exclusive offers</p>
        </div>

        {loading ? (
          <Loading />
        ) : promos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map(promo => (
              <div key={promo.id} className="card hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6 rounded-t-xl">
                  <div className="flex items-center justify-between mb-4">
                    <FiTag size={32} />
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {promo.discount_percent ? `${promo.discount_percent}%` : `Rp ${promo.discount_amount.toLocaleString()}`}
                      </div>
                      <div className="text-sm text-primary-100">OFF</div>
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{promo.title}</h3>
                </div>

                <div className="p-6">
                  {/* Promo Code */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Promo Code</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg font-mono font-bold text-primary-600">
                        {promo.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        <FiCopy className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {promo.min_transaction > 0 && (
                      <p>• Min. transaction: Rp {promo.min_transaction.toLocaleString()}</p>
                    )}
                    {promo.max_discount && (
                      <p>• Max. discount: Rp {promo.max_discount.toLocaleString()}</p>
                    )}
                    {promo.usage_limit && (
                      <p>• Usage: {promo.usage_count}/{promo.usage_limit}</p>
                    )}
                  </div>

                  {/* Valid Period */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 pt-4 border-t">
                    <FiCalendar />
                    <span>Valid until {formatDate(promo.end_date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No active promotions at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Promo