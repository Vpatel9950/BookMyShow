import { useEffect, useState } from 'react';
import { Film, Building2, Monitor, Calendar } from 'lucide-react';
import { adminGetMovies, adminGetTheaters, adminGetScreens, adminGetShows } from '../services/adminApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movies: 0, theaters: 0, screens: 0, shows: 0 });

  useEffect(() => {
    Promise.all([
      adminGetMovies(), adminGetTheaters(), adminGetScreens(), adminGetShows(),
    ]).then(([movies, theaters, screens, shows]) => {
      setStats({
        movies: movies?.length || 0,
        theaters: theaters?.length || 0,
        screens: screens?.length || 0,
        shows: shows?.length || 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Movies', value: stats.movies, icon: Film, color: 'text-red-400' },
    { label: 'Theatres', value: stats.theaters, icon: Building2, color: 'text-blue-400' },
    { label: 'Screens', value: stats.screens, icon: Monitor, color: 'text-green-400' },
    { label: 'Shows', value: stats.shows, icon: Calendar, color: 'text-yellow-400' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
      <p className="text-gray-400 mb-8">Manage movies, theatres, screens and show schedules</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
              </div>
              <Icon size={32} className={color} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Quick Guide</h3>
        <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
          <li>Add a <strong className="text-white">Theatre</strong> with name, city and address</li>
          <li>Create <strong className="text-white">Screens</strong> (audis) inside the theatre — seats are auto-generated</li>
          <li>Add <strong className="text-white">Movies</strong> with poster URL, genre, language and duration</li>
          <li>Schedule <strong className="text-white">Shows</strong> by linking movie + screen + date/time + ticket price</li>
        </ol>
      </div>
    </div>
  );
}
