import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiStar, FiTag } from 'react-icons/fi'
import { roomsService, promosService } from '@services'
import RoomCard from '@components/room/RoomCard'
import { Loading } from '@components/common'

function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([])
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [roomsData, promosData] = await Promise.all([
        roomsService.getRooms({ limit: 3 }),
        promosService.getActivePromos()
      ])
      setFeaturedRooms(roomsData.slice(0, 3))
      setPromos(promosData.slice(0, 3))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section
  className="relative bg-cover bg-center text-white"
  style={{
    backgroundImage: "url('/images/hehe.jpg')",
  }}
>
  <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

        <div className="container-custom py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-primary-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
              Book luxury hotel rooms with best prices and instant confirmation
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/rooms" className="btn bg-white text-primary-600 hover:bg-gray-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                Browse Rooms
              </Link>
              <Link to="/promo" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                View Promos
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-primary-600" size={32} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Instant Confirmation</h3>
              <p className="text-gray-600">Get booking confirmation instantly via email</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="text-primary-600" size={32} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">We guarantee the best rates for your stay</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTag className="text-primary-600" size={32} />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Special Offers</h3>
              <p className="text-gray-600">Exclusive deals and discounts for members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Featured Rooms</h2>
            <p className="text-gray-600 text-lg">Discover our most popular accommodations</p>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {featuredRooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
              <div className="text-center">
                <Link to="/rooms" className="btn btn-primary">
                  View All Rooms
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Promos */}
      {promos.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Active Promotions</h2>
              <p className="text-gray-600 text-lg">Save more with our special offers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promos.map(promo => (
                <div key={promo.id} className="card p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-bold text-lg mb-4">
                    {promo.discount_percent ? `${promo.discount_percent}% OFF` : `Save ${promo.discount_amount}`}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{promo.title}</h3>
                  <p className="text-gray-600 mb-4">Code: <span className="font-mono font-bold text-primary-600">{promo.code}</span></p>
                  <Link to="/promo" className="text-primary-600 font-medium hover:underline">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">Ready to Book Your Stay?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of satisfied guests</p>
          <Link to="/rooms" className="btn bg-white text-gray-900 hover:bg-gray-100">
            Book Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home