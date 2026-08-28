import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Movie from './pages/Movie';
import Release from './pages/Release';
import Booking from './pages/Booking';
import Contact from './pages/Contact';
import MovieDetailPage from './pages/MovieDetailPage';
import MovieDetailPageHome from './pages/MovieDetailPageHome';
import SeatSelector from './pages/SeatSelector';
import BookingSuccess from './pages/BookingSuccess';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminTheaters from './pages/admin/AdminTheaters';
import AdminShows from './pages/admin/AdminShows';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual';
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id) || document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'nearest' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        return;
      }
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function AdminRoute({ children }) {
  const json = localStorage.getItem('cine_auth');
  let user = null;
  if (json) {
    try {
      user = JSON.parse(json);
    } catch (e) {}
  }
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'admin@cineduniya.com';
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const App = () => {
  useEffect(() => {
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;

    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen w-full overflow-x-hidden bg-neutral-950 text-white">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/movies" element={<Movie />} />
          <Route path="/releases" element={<Release />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bookings" element={<Booking />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/movie/:id" element={<MovieDetailPageHome />} />

          <Route path="/movies/:id/seat/:slot" element={<SeatSelector />} />
          <Route path="/movies/:id/seat-selector/:slot" element={<SeatSelector />} />
          <Route path="/movie/:id/seat/:slot" element={<SeatSelector />} />
          <Route path="/movie/:id/seat-selector/:slot" element={<SeatSelector />} />

          {/* Admin Nested Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="theaters" element={<AdminTheaters />} />
            <Route path="shows" element={<AdminShows />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
