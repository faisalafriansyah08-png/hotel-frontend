# 🏨 Hotel Booking System - Frontend

Frontend untuk sistem booking hotel dengan React, Vite, dan Tailwind CSS.

## 🚀 Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Utility-first CSS Framework
- **React Router** - Client-side Routing
- **Axios** - HTTP Client
- **Zustand** - State Management
- **React Icons** - Icon Library
- **React Toastify** - Toast Notifications
- **React DatePicker** - Date Selection

## 📦 Installation

```bash
# Install dependencies
npm install
# atau
yarn install

# Copy environment file
cp .env.example .env

# Edit .env dengan API URL backend Anda
```

## 🔧 Development

```bash
# Start dev server (localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/      # Reusable components
├── pages/          # Page components
├── services/       # API calls
├── context/        # React Context
├── utils/          # Helper functions
├── assets/         # Images, icons
├── App.jsx         # Root component
└── main.jsx        # Entry point
```

## 🔗 Backend Integration

Pastikan backend FastAPI berjalan di `http://localhost:8000`

API Endpoints:
- Auth: `/api/v1/auth/*`
- Rooms: `/api/v1/rooms/*`
- Bookings: `/api/v1/bookings/*`
- Payments: `/api/v1/payments/*`
- Promos: `/api/v1/promos/*`

## 🎨 Styling

Menggunakan Tailwind CSS dengan custom theme di `tailwind.config.js`

Custom classes:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.input`
- `.card`
- `.container-custom`

## 📝 Environment Variables

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Hotel Booking System
```

## 🌐 Features

- ✅ User Authentication (Login/Register)
- ✅ Room Catalog with Filters
- ✅ Room Detail & Availability
- ✅ Booking System
- ✅ Payment Integration
- ✅ Promo Code Validation
- ✅ User Dashboard
- ✅ Responsive Design

## 📞 Support

Untuk pertanyaan atau bantuan, hubungi tim development.

---

**Happy Coding! 🚀**