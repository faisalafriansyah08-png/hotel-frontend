import { Link } from 'react-router-dom'
import { FiUsers, FiWifi, FiTv, FiCoffee } from 'react-icons/fi'
import { formatPrice } from '@utils/formatters'

function RoomCard({ room }) {
  const defaultImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'
  const image = room.images && room.images.length > 0 ? room.images[0] : defaultImage

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImage
          }}
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-primary-600 font-bold">{formatPrice(room.price)}</span>
          <span className="text-gray-600 text-sm">/night</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
          {room.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <FiUsers size={16} />
            <span className="text-sm">{room.capacity} Guests</span>
          </div>
          {room.amenities && room.amenities.includes('WiFi') && (
            <div className="flex items-center space-x-1 text-gray-600">
              <FiWifi size={16} />
              <span className="text-sm">WiFi</span>
            </div>
          )}
          {room.amenities && room.amenities.includes('TV') && (
            <div className="flex items-center space-x-1 text-gray-600">
              <FiTv size={16} />
              <span className="text-sm">TV</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/rooms/${room.id}`}
          className="block w-full text-center btn btn-primary"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default RoomCard