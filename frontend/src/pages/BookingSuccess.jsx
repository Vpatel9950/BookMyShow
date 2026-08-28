import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Ticket, Calendar, MapPin, Mail, ArrowRight, Home } from 'lucide-react';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-500">No Booking Found</h2>
        <p className="text-neutral-400 text-sm">You haven't completed a booking session.</p>
        <Link to="/" className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-medium text-white">
          Return Home
        </Link>
      </div>
    );
  }

  const seatsText = booking.seats?.map((s) => s.seat?.seatNumber).join(', ') || 'N/A';
  const showTime = booking.show?.startTime
    ? new Date(booking.show.startTime).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Booking Confirmed!</h1>
          <p className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
            <Mail size={14} /> Confirmation email sent to {booking.user?.email || 'your email'}
          </p>
        </div>

        {/* Digital Ticket Card */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-inner relative">
          <div className="border-b border-dashed border-neutral-800 pb-4 flex justify-between items-start">
            <div>
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Booking ID</p>
              <p className="text-sm font-bold font-mono text-amber-500">{booking.bookingNumber}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              PAID & CONFIRMED
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-extrabold text-lg text-white">{booking.show?.movie?.title}</h3>
              <p className="text-xs text-neutral-400">{booking.show?.movie?.genre} • {booking.show?.movie?.language}</p>
            </div>

            <div className="flex items-start gap-2 text-neutral-300 text-xs">
              <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">{booking.show?.screen?.theater?.name}</p>
                <p className="text-neutral-400">{booking.show?.screen?.name}, {booking.show?.screen?.theater?.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-300 text-xs">
              <Calendar size={16} className="text-blue-400 shrink-0" />
              <span>{showTime}</span>
            </div>

            <div className="flex items-center gap-2 text-neutral-300 text-xs">
              <Ticket size={16} className="text-amber-400 shrink-0" />
              <span>Seats: <strong className="text-red-400 font-bold">{seatsText}</strong></span>
            </div>
          </div>

          <div className="border-t border-dashed border-neutral-800 pt-4 flex justify-between items-center text-sm">
            <span className="text-neutral-400 text-xs">Total Amount Paid</span>
            <span className="text-xl font-extrabold text-emerald-400">₹{booking.totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/bookings')}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-red-600/30"
          >
            <span>View All My Bookings</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium py-2.5 px-4 rounded-xl transition"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
