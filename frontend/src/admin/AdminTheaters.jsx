import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  adminGetTheaters, adminCreateTheater, adminUpdateTheater, adminDeleteTheater,
} from '../services/adminApi';

const emptyForm = { name: '', address: '', city: '', totalScreens: 1 };
const PAGE_SIZE = 10;

export default function AdminTheaters() {
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
    adminGetTheaters().then(setTheaters).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    theaters.filter((t) =>
      !search || t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase())
    ), [theaters, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name || '', address: t.address || '', city: t.city || '', totalScreens: t.totalScreens || 1 });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) { toast.error('Name and city are required'); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, totalScreens: Number(form.totalScreens) };
      if (editing) { await adminUpdateTheater(editing.id, payload); toast.success('Theatre updated'); }
      else { await adminCreateTheater(payload); toast.success('Theatre created'); }
      setModalOpen(false); load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theatre?')) return;
    try { await adminDeleteTheater(id); toast.success('Theatre deleted'); load(); }
    catch (err) { toast.error(err.message); }
  };

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-red-500 outline-none';

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Theatres</h2>
          <p className="text-gray-400 text-sm">{filtered.length} theatres</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
          <Plus size={16} /> Add Theatre
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input placeholder="Search by name or city..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} className={`${inputCls} pl-9`} />
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">City</th>
                  <th className="text-left p-4">Address</th>
                  <th className="text-left p-4">Screens</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => (
                  <tr key={t.id} className="border-t border-gray-800 text-gray-300">
                    <td className="p-4 text-white font-medium">{t.name}</td>
                    <td className="p-4">{t.city}</td>
                    <td className="p-4 truncate max-w-[200px]">{t.address}</td>
                    <td className="p-4">{t.totalScreens}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(t)} className="text-blue-400 hover:text-blue-300 mr-3"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
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
            <h3 className="text-lg font-bold text-white mb-4">{editing ? 'Edit Theatre' : 'Add Theatre'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Theatre Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
              <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} required />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Total Screens" value={form.totalScreens} min={1}
                onChange={(e) => setForm({ ...form, totalScreens: e.target.value })} className={inputCls} />
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
