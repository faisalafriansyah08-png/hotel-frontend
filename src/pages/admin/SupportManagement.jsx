import { useEffect, useState } from 'react'
import { supportService } from '@services'
import { Modal, Loading, Button } from '@components/common'
import { toast } from 'react-toastify'
import { FiMessageSquare, FiUser } from 'react-icons/fi'
import { formatDate } from '@utils/formatters'

function SupportManagement() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState('in_progress')

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const data = await supportService.getMyTickets() // Admin sees all
      setTickets(data)
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket)
    setResponse(ticket.response || '')
    setStatus(ticket.status)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await supportService.updateTicket(selectedTicket.id, status, response)
      toast.success('Ticket updated successfully')
      setShowModal(false)
      loadTickets()
    } catch (error) {
      toast.error('Failed to update ticket')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      await supportService.deleteTicket(id)
      toast.success('Ticket deleted successfully')
      loadTickets()
    } catch (error) {
      toast.error('Failed to delete ticket')
    }
  }

  if (loading) return <Loading fullScreen />

  const openTickets = tickets.filter(t => t.status === 'open')
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress')
  const closedTickets = tickets.filter(t => t.status === 'closed')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Support Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-semibold mb-1">Open</p>
          <p className="text-3xl font-bold text-yellow-900">{openTickets.length}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 font-semibold mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-900">{inProgressTickets.length}</p>
        </div>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          <p className="text-gray-800 font-semibold mb-1">Closed</p>
          <p className="text-3xl font-bold text-gray-900">{closedTickets.length}</p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600">
                    From: {ticket.user?.name} ({ticket.user?.email})
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(ticket.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">{ticket.message}</p>
              {ticket.response && (
                <div className="mt-3 p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                  <p className="text-sm font-semibold text-primary-900 mb-1">Admin Response:</p>
                  <p className="text-sm text-primary-800">{ticket.response}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleOpenModal(ticket)}
                size="sm"
                variant="primary"
                className="flex items-center space-x-1"
              >
                <FiMessageSquare size={16} />
                <span>Respond</span>
              </Button>
              {ticket.status === 'closed' && (
                <Button
                  onClick={() => handleDelete(ticket.id)}
                  size="sm"
                  variant="danger"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiMessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No support tickets yet</p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Respond to Ticket"
        size="lg"
      >
        {selectedTicket && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">{selectedTicket.subject}</p>
              <p className="text-gray-700 text-sm">{selectedTicket.message}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Response</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows="5"
                  className="input"
                  placeholder="Type your response here..."
                  required
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" variant="primary" className="flex-1">
                  Send Response
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SupportManagement