import { useEffect, useState } from 'react'
import { roomsService } from '@services'
import RoomCard from '@components/room/RoomCard'
import RoomFilter from '@components/room/RoomFilter'
import { Loading } from '@components/common'
import { toast } from 'react-toastify'

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async (filterParams = {}) => {
    setLoading(true)
    try {
      const data = await roomsService.getRooms(filterParams)
      setRooms(data)
    } catch (error) {
      console.error('Error loading rooms:', error)
      toast.error('Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async (filterData) => {
    setFilters(filterData)
    
    const params = {}
    if (filterData.checkIn && filterData.checkOut) {
      params.check_in = filterData.checkIn
      params.check_out = filterData.checkOut
    }
    if (filterData.minCapacity) {
      params.min_capacity = filterData.minCapacity
    }
    if (filterData.maxPrice) {
      params.max_price = filterData.maxPrice
    }

    await loadRooms(params)
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">Our Rooms</h1>
          <p className="text-gray-600 text-lg">Find the perfect room for your stay</p>
        </div>

        {/* Filter */}
        <RoomFilter onFilter={handleFilter} />

        {/* Results */}
        {loading ? (
          <Loading />
        ) : rooms.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">
              Found {rooms.length} room{rooms.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No rooms found matching your criteria</p>
            <button
              onClick={() => {
                setFilters({})
                loadRooms()
              }}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Rooms