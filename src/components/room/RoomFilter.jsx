import { useState } from 'react'
import { FiSearch, FiSliders } from 'react-icons/fi'

function RoomFilter({ onFilter, onSearch }) {
  const [filters, setFilters] = useState({
    minCapacity: '',
    maxPrice: '',
    checkIn: '',
    checkOut: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onFilter(filters)
  }

  const handleReset = () => {
    setFilters({
      minCapacity: '',
      maxPrice: '',
      checkIn: '',
      checkOut: '',
    })
    onFilter({})
  }

  return (
    <div className="card p-6 mb-8">
      <form onSubmit={handleSubmit}>
        {/* Main Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              name="checkIn"
              value={filters.checkIn}
              onChange={handleChange}
              className="input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              name="checkOut"
              value={filters.checkOut}
              onChange={handleChange}
              className="input"
              min={filters.checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              <FiSearch />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <FiSliders />
              <span className="hidden md:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Capacity
              </label>
              <select
                name="minCapacity"
                value={filters.minCapacity}
                onChange={handleChange}
                className="input"
              >
                <option value="">Any</option>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5+ People</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (per night)
              </label>
              <select
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                className="input"
              >
                <option value="">Any</option>
                <option value="500000">Rp 500.000</option>
                <option value="750000">Rp 750.000</option>
                <option value="1000000">Rp 1.000.000</option>
                <option value="1500000">Rp 1.500.000</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary w-full md:w-auto"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default RoomFilter