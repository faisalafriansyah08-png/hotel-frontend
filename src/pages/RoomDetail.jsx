import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { roomsService } from '@services'
import { Loading } from '@components/common'
import { formatPrice } from '@utils/formatters'
import { FiUsers, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { toast } from 'react-toastify'

function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  useEffect(() => {
    loadRoom()
  }, [id])

  const loadRoom = async () => {
    try {
      const data = await roomsService.getRoomById(id)
      setRoom(data)
    } catch (error) {
      console.error('Error loading room:', error)
      toast.error('Failed to load room details')
      navigate('/rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      toast.warning('Please select check-in and check-out dates')
      return
    }
    navigate('/booking', { 
      state: { 
        roomId: room.id,
        roomName: room.name,
        price: room.price,
        checkIn,
        checkOut
      }
    })
  }

  if (loading) return <Loading fullScreen />
  if (!room) return null

  const defaultImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Back Button */}
        <Link to="/rooms" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6">
          <FiArrowLeft />
          <span>Back to Rooms</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="rounded-xl overflow-hidden mb-4">
              <img
                src={room.images?.[0] || defaultImage}
                alt={room.name}
                className="w-full h-96 object-cover"
                onError={(e) => e.target.src = defaultImage}
              />
            </div>
            {room.images && room.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {room.images.slice(1, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${room.name} ${idx + 2}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => e.target.src = defaultImage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display text-3xl font-bold mb-4">{room.name}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <FiUsers />
                <span>Up to {room.capacity} guests</span>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(room.price)}
                <span className="text-base text-gray-600 font-normal">/night</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{room.description}</p>

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-gray-700">
                      <FiCheck className="text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Card */}
            <div className="card p-6 bg-gray-50">
              <h3 className="font-display font-bold text-lg mb-4">Book This Room</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                </div>
                <button
                  onClick={handleBookNow}
                  className="btn btn-primary w-full"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail
