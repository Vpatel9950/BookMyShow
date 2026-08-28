import React, { useEffect, useState } from 'react';
import { getAllTheaters, createTheater, deleteTheater } from '../../api/theaterApi';
import { createScreen, getAllScreens, deleteScreen } from '../../api/screenApi';
import { toast } from 'react-toastify';
import { Plus, Building, Tv, X, Trash2 } from 'lucide-react';

const AdminTheaters = () => {
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [theaterModal, setTheaterModal] = useState(false);
  const [screenModal, setScreenModal] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);

  const [theaterForm, setTheaterForm] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    totalScreens: 3,
  });

  const [screenForm, setScreenForm] = useState({
    name: '',
    totalSeats: 40,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [theatersData, screensData] = await Promise.all([
        getAllTheaters().catch(() => []),
        getAllScreens().catch(() => []),
      ]);
      setTheaters(theatersData);
      setScreens(screensData);
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTheater = async (e) => {
    e.preventDefault();
    try {
      await createTheater(theaterForm);
      toast.success('Theater created successfully!');
      setTheaterModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create theater: ' + err.message);
    }
  };

  const handleDeleteTheater = async (t) => {
    if (!window.confirm(`Are you sure you want to delete theater: ${t.name}?`)) return;
    try {
      await deleteTheater(t.id);
      toast.success('Theater deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete theater: ' + err.message);
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheater) return;
    try {
      await createScreen({
        name: screenForm.name,
        totalSeats: Number(screenForm.totalSeats),
        theater: { id: selectedTheater.id },
      });
      toast.success(`Screen created for ${selectedTheater.name}`);
      setScreenModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create screen: ' + err.message);
    }
  };

  const handleDeleteScreen = async (sc) => {
    if (!window.confirm(`Are you sure you want to delete screen: ${sc.name}?`)) return;
    try {
      await deleteScreen(sc.id);
      toast.success('Screen deleted successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete screen: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Theater & Screen Management</h1>
          <p className="text-neutral-400 text-sm">Manage cinema venues and screen layouts.</p>
        </div>
        <button
          onClick={() => setTheaterModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-red-600/30"
        >
          <Plus size={18} />
          <span>Add New Theater</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-400">Loading theaters...</div>
        ) : theaters.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-400">No theaters found. Create one to get started.</div>
        ) : (
          theaters.map((t) => {
            const theaterScreens = screens.filter((s) => s.theater?.id === t.id);
            return (
              <div key={t.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-950/60 text-red-500 rounded-xl border border-red-800/40">
                      <Building size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{t.name}</h3>
                      <p className="text-xs text-neutral-400">{t.city}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTheater(t)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition"
                    title="Delete Theater"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2">{t.address}</p>

                <div className="border-t border-neutral-800 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Screens</h4>
                    <button
                      onClick={() => {
                        setSelectedTheater(t);
                        setScreenForm({ name: `Audi ${theaterScreens.length + 1}`, totalSeats: 40 });
                        setScreenModal(true);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Screen
                    </button>
                  </div>

                  {theaterScreens.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No screens added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {theaterScreens.map((sc) => (
                        <div key={sc.id} className="flex items-center justify-between bg-neutral-950 px-3 py-2 rounded-xl text-xs">
                          <div className="flex items-center gap-2 text-neutral-200 font-medium">
                            <Tv size={14} className="text-amber-500" />
                            <span>{sc.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-400">{sc.totalSeats} Seats</span>
                            <button
                              onClick={() => handleDeleteScreen(sc)}
                              className="text-neutral-500 hover:text-red-400 transition p-1"
                              title="Delete Screen"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Theater Modal */}
      {theaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setTheaterModal(false)} className="absolute top-5 right-5 text-neutral-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">Add New Theater</h2>

            <form onSubmit={handleCreateTheater} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Theater Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PVR Phoenix Marketcity"
                  value={theaterForm.name}
                  onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={theaterForm.city}
                  onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Address</label>
                <textarea
                  required
                  rows="2"
                  value={theaterForm.address}
                  onChange={(e) => setTheaterForm({ ...theaterForm, address: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTheaterModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium">
                  Create Theater
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {screenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setScreenModal(false)} className="absolute top-5 right-5 text-neutral-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">Add Screen ({selectedTheater?.name})</h2>

            <form onSubmit={handleCreateScreen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Screen / Audi Name</label>
                <input
                  type="text"
                  required
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Total Capacity Seats</label>
                <input
                  type="number"
                  required
                  value={screenForm.totalSeats}
                  onChange={(e) => setScreenForm({ ...screenForm, totalSeats: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setScreenModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium">
                  Create Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheaters;
