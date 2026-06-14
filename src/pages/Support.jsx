import { useState, useEffect } from 'react'
import { supportService } from '@services'
import { useAuth } from '@context/AuthContext'
import { Loading } from '@components/common'
import { toast } from 'react-toastify'
import { FiMessageSquare, FiSend } from 'react-icons/fi'
import { formatDate } from '@utils/formatters'

function Support() {
  const { isAuthenticated } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets()
    }
  }, [isAuthenticated])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const data = await supportService.getMyTickets()
      setTickets(data)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await supportService.createTicket(formData.subject, formData.message)
      toast.success('Support ticket created successfully!')
      setFormData({ subject: '', message: '' })
      if (isAuthenticated) {
        loadTickets()
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Customer Support</h1>
          <p className="text-gray-600">We're here to help you</p>
        </div>

        {/* Create Ticket Form */}
        <div className="card p-6 mb-8">
          <h2 className="font-display text-xl font-bold mb-4">Create Support Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of your issue"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your issue in detail..."
                className="input"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <FiSend />
              <span>{submitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </form>
        </div>

        {/* My Tickets */}
        {isAuthenticated && (
          <div className="card p-6">
            <h2 className="font-display text-xl font-bold mb-4">My Support Tickets</h2>

            {loading ? (
              <Loading />
            ) : tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <FiMessageSquare className="text-primary-600" size={20} />
                        <h3 className="font-semibold">{ticket.subject}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{ticket.message}</p>
                    {ticket.response && (
                      <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                        <p className="text-sm font-medium text-primary-900 mb-1">Admin Response:</p>
                        <p className="text-sm text-primary-800">{ticket.response}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(ticket.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No support tickets yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Support