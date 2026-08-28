import React, { useEffect, useState } from 'react';
import { getAllBookings, cancelBooking } from '../../api/bookingApi';
import { toast } from 'react-toastify';
import { Ticket, User, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load system bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking and release booked seats?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Bookings</h1>
        <p className="text-neutral-400 text-sm">View and manage all customer ticket bookings across CineDuniya.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800 uppercase text-xs">
              <tr>
                <th className="py-4 px-6">Booking Ref</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Movie & Show</th>
                <th className="py-4 px-6">Seats</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-400">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-400">No system bookings found.</td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const seatsText = b.seats?.map((s) => s.seat?.seatNumber).join(', ') || 'N/A';
                  const bookingDate = b.bookingTime
                    ? new Date(b.bookingTime).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'N/A';

                  return (
                    <tr key={b.id} className="hover:bg-neutral-800/50 transition">
                      <td className="py-4 px-6 font-semibold text-amber-500 font-mono text-xs">
                        {b.bookingNumber || `REF#${b.id}`}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <User size={14} className="text-neutral-400" />
                          <span>{b.user?.name || 'Customer'}</span>
                        </div>
                        <div className="text-xs text-neutral-400">{b.user?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{b.show?.movie?.title || 'Movie'}</div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1">
                          <Calendar size={12} className="text-neutral-500" />
                          {b.show?.screen?.theater?.name} ({b.show?.screen?.name})
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-red-400">{seatsText}</td>
                      <td className="py-4 px-6 font-bold text-emerald-400">₹{b.totalAmount || 0}</td>
                      <td className="py-4 px-6">
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
                      </td>
                      <td className="py-4 px-6 text-right">
                        {b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-medium border border-red-800/30 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
