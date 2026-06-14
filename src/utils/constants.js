
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Hotel Booking System'
export const API_URL = import.meta.env.VITE_API_URL

export const ROOM_STATUS = {
  AVAILABLE: 'available',
  MAINTENANCE: 'maintenance',
  DISABLED: 'disabled',
}

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const PAYMENT_GATEWAY = {
  XENDIT: 'xendit',
  MIDTRANS: 'midtrans',
}

export const USER_ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin',
}

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}