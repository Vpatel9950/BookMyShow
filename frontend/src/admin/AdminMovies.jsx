import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  adminGetMovies, adminCreateMovie, adminUpdateMovie, adminDeleteMovie,
} from '../services/adminApi';

const emptyForm = {
  title: '', description: '', language: 'Hindi', genre: 'Action',
  durationMins: 120, releaseDate: '', posterUrl: '',
};

const PAGE_SIZE = 8;

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetMovies()
      .then(setMovies)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genreFilter === 'all' || m.genre?.toLowerCase() === genreFilter.toLowerCase();
      return matchSearch && matchGenre;
    });
  }, [movies, search, genreFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (movie) => {
    setEditing(movie);
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      language: movie.language || 'Hindi',
      genre: movie.genre || 'Action',
      durationMins: movie.durationMins || 120,
      releaseDate: movie.releaseDate || '',
      posterUrl: movie.posterUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.durationMins || form.durationMins < 1) { toast.error('Valid duration required'); return; }

    setSubmitting(true);
    try {
      const payload = { ...form, durationMins: Number(form.durationMins) };
      if (editing) {
        await adminUpdateMovie(editing.id, payload);
        toast.success('Movie updated');
      } else {
        await adminCreateMovie(payload);
        toast.success('Movie created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      await adminDeleteMovie(id);
      toast.success('Movie deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none';

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Movies</h2>
          <p className="text-gray-400 text-sm">{filtered.length} movies</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
          <Plus size={16} /> Add Movie
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input placeholder="Search movies..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`${inputCls} pl-9`} />
        </div>
        <select value={genreFilter} onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
          className={`${inputCls} w-auto`}>
          <option value="all">All Genres</option>
          {['Action', 'Comedy', 'Horror', 'Adventure', 'Sci-Fi', 'Drama'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginated.map((m) => (
              <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <img src={m.posterUrl} alt={m.title} className="w-full h-40 object-cover bg-gray-800"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Poster'; }} />
                <div className="p-4">
                  <h3 className="text-white font-semibold truncate">{m.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{m.genre} · {m.language} · {m.durationMins}m</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(m)} className="flex-1 flex items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-white py-1.5 rounded text-xs">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded text-xs">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${page === p ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Movie' : 'Add Movie'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} required />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20 resize-none`} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputCls} />
                <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className={inputCls}>
                  {['Action', 'Comedy', 'Horror', 'Adventure', 'Sci-Fi', 'Drama'].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Duration (mins) *" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: e.target.value })} className={inputCls} required min={1} />
                <input type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} className={inputCls} />
              </div>
              <input placeholder="Poster URL" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} className={inputCls} />
              {form.posterUrl && (
                <img src={form.posterUrl} alt="Preview" className="w-24 h-32 object-cover rounded border border-gray-700"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 text-white py-2 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-red-600 text-white py-2 rounded-lg disabled:opacity-50">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
