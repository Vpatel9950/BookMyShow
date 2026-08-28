import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Film, Building2, Monitor, Calendar, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/movies', label: 'Movies', icon: Film },
  { to: '/admin/theaters', label: 'Theatres', icon: Building2 },
  { to: '/admin/screens', label: 'Screens', icon: Monitor },
  { to: '/admin/shows', label: 'Shows', icon: Calendar },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 flex">
      <aside className="w-64 bg-gray-900/80 border-r border-gray-800 p-6 flex flex-col shrink-0">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            Admin Panel
          </h1>
          <p className="text-gray-500 text-xs mt-1">CineDuniya Management</p>
        </div>

        <nav className="space-y-1 flex-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/" className="flex items-center gap-2 text-gray-500 hover:text-white text-sm mt-6 pt-6 border-t border-gray-800">
          <ArrowLeft size={16} /> Back to Site
        </NavLink>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
