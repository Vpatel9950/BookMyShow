import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  adminGetScreens, adminGetTheaters, adminCreateScreen, adminUpdateScreen, adminDeleteScreen,
} from '../services/adminApi';

const emptyForm = { name: '', totalSeats: 40, theaterId: '' };
const PAGE_SIZE = 10;

export default function AdminScreens() {
  const [screens, setScreens] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminGetScreens(), adminGetTheaters()])
      .then(([s, t]) => { setScreens(s); setTheaters(t); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    screens.filter((s) =>
      !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.theater?.name?.toLowerCase().includes(search.toLowerCase())
    ), [screens, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, theaterId: theaters[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name || '', totalSeats: s.totalSeats || 40, theaterId: s.theater?.id || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.theaterId) { toast.error('Name and theatre are required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        totalSeats: Number(form.totalSeats),
        theater: { id: Number(form.theaterId) },
      };
      if (editing) { await adminUpdateScreen(editing.id, payload); toast.success('Screen updated'); }
      else { await adminCreateScreen(payload); toast.success('Screen created with seats'); }
      setModalOpen(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this screen?')) return;
    try { await adminDeleteScreen(id); toast.success('Screen deleted'); load(); }
    catch (err) { toast.error(err.message); }
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none';

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Screens</h2>
          <p className="text-gray-400 text-sm">{filtered.length} screens · seats auto-generated on create</p>
        </div>
        <button onClick={openCreate} disabled={theaters.length === 0}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">
          <Plus size={16} /> Add Screen
        </button>
      </div>

      {theaters.length === 0 && (
        <p className="text-yellow-400 text-sm mb-4">Create a theatre first before adding screens.</p>
      )}

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input placeholder="Search screens..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${inputCls} pl-9`} />
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="text-left p-4">Screen Name</th>
                  <th className="text-left p-4">Theatre</th>
                  <th className="text-left p-4">City</th>
                  <th className="text-left p-4">Seats</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.id} className="border-t border-gray-800 text-gray-300">
                    <td className="p-4 text-white font-medium">{s.name}</td>
                    <td className="p-4">{s.theater?.name}</td>
                    <td className="p-4">{s.theater?.city}</td>
                    <td className="p-4">{s.totalSeats}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(s)} className="text-blue-400 hover:text-blue-300 mr-3"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded text-sm ${page === p ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Screen' : 'Add Screen'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Screen / Audi Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
              <select value={form.theaterId} onChange={(e) => setForm({ ...form, theaterId: e.target.value })} className={inputCls} required>
                <option value="">Select Theatre</option>
                {theaters.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.city}</option>)}
              </select>
              <input type="number" placeholder="Total Seats" value={form.totalSeats} min={8}
                onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} className={inputCls} />
              {!editing && <p className="text-gray-500 text-xs">Seats (rows A–E) will be auto-generated on create.</p>}
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
