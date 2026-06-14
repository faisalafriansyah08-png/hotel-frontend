// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout Components
import Navbar from '@components/common/Navbar'
import Footer from '@components/common/Footer'

// Pages
import Home from '@pages/Home'
import Rooms from '@pages/Rooms'
import RoomDetail from '@pages/RoomDetail'
import Booking from '@pages/Booking'
import Payment from '@pages/Payment'
import Login from '@pages/Login'
import Register from '@pages/Register'
import Dashboard from '@pages/Dashboard'
import Promo from '@pages/Promo'
import Support from '@pages/Support'

// Admin Pages
import AdminLayout from '@pages/admin/Layout'
import AdminDashboard from '@pages/admin/Dashboard'
import RoomManagement from '@pages/admin/RoomManagement'
import BookingManagement from '@pages/admin/BookingManagement'
import PromoManagement from '@pages/admin/PromoManagement'
import SupportManagement from '@pages/admin/SupportManagement'
import PaymentConfirmation from '@pages/admin/PaymentConfirmation'
import ReservationReport from '@pages/admin/ReservationReport'

// Staff Pages
import StaffLayout from '@pages/staff/Layout'
import StaffDashboard from '@pages/staff/StaffDashboard'

// Context & Guards
import { AuthProvider } from '@context/AuthContext'
import ProtectedRoute from '@components/common/ProtectedRoute'
import UserManagement from '@pages/admin/UserManagement'
import RoomSchedule from '@pages/staff/RoomSchedule'
import RoomStatusUpdate from '@pages/staff/RoomStatusUpdate'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Public Routes — dengan Navbar & Footer */}
          <Route path="/*" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/rooms/:id" element={<RoomDetail />} />
                  <Route path="/promo" element={<Promo />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/booking" element={
                    <ProtectedRoute><Booking /></ProtectedRoute>
                  } />
                  <Route path="/payment/:bookingId" element={
                    <ProtectedRoute><Payment /></ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />

          {/* Admin Routes — tanpa Navbar/Footer */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="promos" element={<PromoManagement />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="report" element={<ReservationReport />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={
            <ProtectedRoute roles={['staff']}>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StaffDashboard />} />
            <Route path="rooms" element={<RoomSchedule />} />
            <Route path="payment-confirmation" element={<PaymentConfirmation />} />
            <Route path="room-status" element={<RoomStatusUpdate />} />
          </Route>

        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  )
}

function NotFound() {
  return (
    <div className="container-custom py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="btn btn-primary">Back to Home</a>
    </div>
  )
}

export default App