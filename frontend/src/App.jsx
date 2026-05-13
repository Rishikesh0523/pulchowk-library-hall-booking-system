import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Rooms from './pages/Rooms.jsx';
import BookingForm from './pages/BookingForm.jsx';
import MyBookings from './pages/MyBookings.jsx';
import CalendarPage from './pages/Calendar.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageRooms from './pages/admin/ManageRooms.jsx';
import ManageBookings from './pages/admin/ManageBookings.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/rooms"
      element={
        <ProtectedRoute>
          <Rooms />
        </ProtectedRoute>
      }
    />
    <Route
      path="/book/:roomId?"
      element={
        <ProtectedRoute>
          <BookingForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-bookings"
      element={
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/calendar"
      element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/admin"
      element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/rooms"
      element={
        <ProtectedRoute adminOnly>
          <ManageRooms />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/bookings"
      element={
        <ProtectedRoute adminOnly>
          <ManageBookings />
        </ProtectedRoute>
      }
    />

    <Route path="/404" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default App;
