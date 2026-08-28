import React, { useEffect, useState } from 'react';
import { getAllMovies } from '../../api/movieApi';
import { getAllTheaters } from '../../api/theaterApi';
import { getAllShows } from '../../api/showApi';
import { getAllBookings } from '../../api/bookingApi';
import { Film, Building, Calendar, Ticket, IndianRupee } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    theaters: 0,
    shows: 0,
    bookings: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [movies, theaters, shows, bookings] = await Promise.all([
          getAllMovies().catch(() => []),
          getAllTheaters().catch(() => []),
          getAllShows().catch(() => []),
          getAllBookings().catch(() => []),
        ]);

        const totalRevenue = bookings.reduce((sum, b) => {
          return b.status === 'CONFIRMED' ? sum + (b.totalAmount || 0) : sum;
        }, 0);

        setStats({
          movies: movies.length,
          theaters: theaters.length,
          shows: shows.length,
          bookings: bookings.length,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center text-neutral-400 p-12">Loading Admin Dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Movies', value: stats.movies, icon: Film, color: 'from-red-600 to-red-800' },
    { title: 'Total Theaters', value: stats.theaters, icon: Building, color: 'from-amber-600 to-amber-800' },
    { title: 'Active Shows', value: stats.shows, icon: Calendar, color: 'from-blue-600 to-blue-800' },
    { title: 'Total Bookings', value: stats.bookings, icon: Ticket, color: 'from-purple-600 to-purple-800' },
    { title: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'from-emerald-600 to-emerald-800' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-neutral-400 text-sm mt-1">Real-time statistics across CineDuniya system.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border border-white/10 shadow-xl flex items-center justify-between`}
            >
              <div>
                <p className="text-sm font-medium text-white/80">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{card.value}</h3>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Icon size={28} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
