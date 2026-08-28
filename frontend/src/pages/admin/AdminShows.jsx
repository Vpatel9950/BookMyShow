import React, { useEffect, useState } from 'react';
import { getAllShows, createShow, deleteShow } from '../../api/showApi';
import { getAllMovies } from '../../api/movieApi';
import { getAllScreens } from '../../api/screenApi';
import { toast } from 'react-toastify';
import { Plus, Trash2, Calendar, Clock, Tv, Film, X } from 'lucide-react';

const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    movieId: '',
    screenId: '',
    startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    ticketPrice: 250,
    language: 'Hindi',
    format: '2D',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsData, moviesData, screensData] = await Promise.all([
        getAllShows().catch(() => []),
        getAllMovies().catch(() => []),
        getAllScreens().catch(() => []),
      ]);
      setShows(showsData);
      setMovies(moviesData);
      setScreens(screensData);
      if (moviesData.length > 0) setForm((f) => ({ ...f, movieId: moviesData[0].id }));
      if (screensData.length > 0) setForm((f) => ({ ...f, screenId: screensData[0].id }));
    } catch (err) {
      toast.error('Failed to load shows data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!form.movieId || !form.screenId) {
      toast.error('Please select both a movie and a screen.');
      return;
    }
    try {
      const selectedMovie = movies.find((m) => String(m.id) === String(form.movieId));
      const duration = selectedMovie ? selectedMovie.durationMins || 120 : 120;
      const startDate = new Date(form.startTime);
      const endDate = new Date(startDate.getTime() + duration * 60000);

      await createShow({
        movie: { id: Number(form.movieId) },
        screen: { id: Number(form.screenId) },
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        ticketPrice: Number(form.ticketPrice),
        language: form.language,
        format: form.format,
      });

      toast.success('Show scheduled successfully!');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to schedule show: ' + err.message);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await deleteShow(id);
      toast.success('Show deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete show: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Showtime Management</h1>
          <p className="text-neutral-400 text-sm">Schedule movie screenings across theater screens.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-red-600/30"
        >
          <Plus size={18} />
          <span>Schedule New Show</span>
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800 uppercase text-xs">
              <tr>
                <th className="py-4 px-6">Movie</th>
                <th className="py-4 px-6">Theater & Screen</th>
                <th className="py-4 px-6">Showtime</th>
                <th className="py-4 px-6">Base Ticket Price</th>
                <th className="py-4 px-6">Available Seats</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400">Loading shows...</td>
                </tr>
              ) : shows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400">No scheduled shows found.</td>
                </tr>
              ) : (
                shows.map((show) => {
                  const startTimeFormatted = show.startTime
                    ? new Date(show.startTime).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'N/A';

                  const availCount = show.availableSeats ? show.availableSeats.length : 0;

                  return (
                    <tr key={show.id} className="hover:bg-neutral-800/50 transition">
                      <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                        <Film size={16} className="text-red-500" />
                        <span>{show.movie?.title}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-neutral-200">{show.screen?.theater?.name || 'N/A'}</div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1">
                          <Tv size={12} className="text-amber-500" />
                          {show.screen?.name} ({show.screen?.theater?.city})
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                          <Clock size={14} className="text-blue-400" />
                          <span>{startTimeFormatted}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-400">
                        ₹{show.ticketPrice || 250}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium">
                          {availCount} Available
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteShow(show.id)}
                          className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition"
                          title="Delete Show"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-neutral-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">Schedule New Show</h2>

            <form onSubmit={handleCreateShow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Select Movie</label>
                <select
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} ({m.language})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Select Screen</label>
                <select
                  value={form.screenId}
                  onChange={(e) => setForm({ ...form, screenId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {screens.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.theater?.name} - {sc.name} ({sc.theater?.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Ticket Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.ticketPrice}
                    onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium">
                  Create Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShows;
