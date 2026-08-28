import React, { useEffect, useState } from 'react';
import { getBookingsByUser, cancelBooking } from '../api/bookingApi';
import { toast } from 'react-toastify';
import { Ticket, Calendar, MapPin, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const authJson = localStorage.getItem('cine_auth');
  const user = authJson ? JSON.parse(authJson) : null;

  const fetchUserBookings = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getBookingsByUser(user.id);
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load your booking history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refunds will be processed.')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully.');
      fetchUserBookings();
    } catch (err) {
      toast.error('Cancellation failed: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle size={48} className="text-amber-500" />
        <h2 className="text-2xl font-bold">Please Log In</h2>
        <p className="text-neutral-400 text-sm">Log in to view your ticket bookings and history.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-600/30"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Movie Tickets</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage and view your booking history for {user.name || user.email}.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-neutral-400">Loading your tickets...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center space-y-4">
            <Ticket size={48} className="text-neutral-600 mx-auto" />
            <h3 className="text-xl font-bold text-neutral-300">No Tickets Booked Yet</h3>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto">Explore current movies and book your seats for the ultimate cinematic experience.</p>
            <button
              onClick={() => navigate('/movies')}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-600/30"
            >
              Explore Movies
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const seatsText = b.seats?.map((s) => s.seat?.seatNumber).join(', ') || 'N/A';
              const showTime = b.show?.startTime
                ? new Date(b.show.startTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'N/A';

              return (
                <div
                  key={b.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-neutral-700 transition"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-amber-500 font-bold bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                        {b.bookingNumber || `REF#${b.id}`}
                      </span>

                      {b.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium">
                          <CheckCircle2 size={12} /> CONFIRMED
                        </span>
                      ) : b.status === 'CANCELLED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-red-950/60 text-red-400 border border-red-800/40 font-medium">
                          <XCircle size={12} /> CANCELLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-950/60 text-amber-400 border border-amber-800/40 font-medium">
                          <Clock size={12} /> {b.status || 'PENDING'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">{b.show?.movie?.title || 'Movie Ticket'}</h3>
                      <p className="text-xs text-neutral-400">{b.show?.movie?.genre} • {b.show?.movie?.language}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        <span>{b.show?.screen?.theater?.name} ({b.show?.screen?.name})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-blue-400 shrink-0" />
                        <span>{showTime}</span>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-400">
                      Seats: <strong className="text-red-400 font-bold">{seatsText}</strong>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-neutral-800 pt-4 sm:pt-0 gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-neutral-400">Total Paid</div>
                      <div className="text-xl font-extrabold text-emerald-400">₹{b.totalAmount || 0}</div>
                    </div>

                    {b.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-xs font-semibold border border-red-800/30 transition"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
