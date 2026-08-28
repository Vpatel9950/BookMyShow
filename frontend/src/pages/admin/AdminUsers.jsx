import React, { useEffect, useState } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
import { toast } from 'react-toastify';
import { User, Mail, Phone, ShieldCheck, Plus, Edit2, Trash2, X, Key } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'ADMIN',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'ADMIN',
    });
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      password: '',
      role: u.role || 'USER',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updated = await updateUser(editingUser.id, form);
        toast.success('User details updated successfully!');

        // If editing currently logged in admin, update cine_auth in localStorage
        const authJson = localStorage.getItem('cine_auth');
        if (authJson) {
          try {
            const currentAuth = JSON.parse(authJson);
            if (currentAuth.id === editingUser.id) {
              const newAuth = { ...currentAuth, name: updated.name, email: updated.email, role: updated.role };
              localStorage.setItem('cine_auth', JSON.stringify(newAuth));
            }
          } catch (e) {}
        }
      } else {
        if (!form.password) {
          toast.error('Password is required for new account');
          return;
        }
        await createUser({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          role: form.role,
        });
        toast.success(`New ${form.role} account created successfully!`);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error('Operation failed: ' + err.message);
    }
  };

  const handleDelete = async (userObj) => {
    if (!window.confirm(`Are you sure you want to delete account: ${userObj.email}?`)) return;
    try {
      await deleteUser(userObj.id);
      toast.success('User account deleted successfully.');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User & Admin Management</h1>
          <p className="text-neutral-400 text-sm">Manage user accounts, admin permissions, and credentials.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-purple-600/30"
        >
          <Plus size={18} />
          <span>Add New Admin / User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800 uppercase text-xs">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400">No registered users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-800/50 transition">
                    <td className="py-4 px-6 font-mono text-xs text-neutral-500">#{u.id}</td>
                    <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                      <User size={16} className={u.role === 'ADMIN' ? 'text-purple-400' : 'text-red-500'} />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <Mail size={14} className="text-neutral-500" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <Phone size={14} className="text-neutral-500" />
                        <span>{u.phoneNumber || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-purple-950/60 text-purple-400 border border-purple-800/40 font-semibold">
                          <ShieldCheck size={12} /> ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-800 text-neutral-300 font-medium">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                          title="Edit Credentials / Role"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 transition"
                          title="Remove Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 text-neutral-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">{editingUser ? 'Edit User Credentials' : 'Add New Admin / User'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Account Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-semibold text-purple-400"
                >
                  <option value="ADMIN">ADMIN (System Manager)</option>
                  <option value="USER">USER (Customer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">
                  {editingUser ? 'New Password (Leave blank to keep current)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder={editingUser ? '••••••••' : 'Enter password'}
                    required={!editingUser}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
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
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium">
                  {editingUser ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
