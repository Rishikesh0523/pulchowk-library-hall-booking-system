import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { roomsApi } from '../../services/api.js';
import { Plus, X } from 'lucide-react';

const ROOM_TYPES = ['reading', 'study', 'conference', 'discussion', 'lab', 'auditorium'];
const STATUS = ['available', 'maintenance', 'unavailable'];

const empty = { id: null, name: '', roomType: 'reading', capacity: 10, description: '', status: 'available' };

const statusBadge = (s) =>
  s === 'available' ? 'badge-success' : s === 'maintenance' ? 'badge-warning' : 'badge-danger';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    roomsApi.list().then(d => setRooms(d.rooms)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setShowForm(true); setError(''); };
  const openEdit = (r) => {
    setForm({
      id: r.id, name: r.name, roomType: r.room_type, capacity: r.capacity,
      description: r.description || '', status: r.status,
    });
    setShowForm(true); setError('');
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        roomType: form.roomType,
        capacity: parseInt(form.capacity, 10),
        description: form.description,
        status: form.status,
      };
      if (form.id) await roomsApi.update(form.id, payload);
      else         await roomsApi.create(payload);
      setShowForm(false); load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room');
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this room? Existing bookings will be removed.')) return;
    await roomsApi.remove(id);
    load();
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Manage rooms</h1>
          <p className="text-ink-500 mt-1 text-sm">Add, edit, or remove rooms.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add room
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-ink-500 uppercase tracking-wide bg-ink-50 border-b border-ink-200">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Capacity</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rooms.map(r => (
              <tr key={r.id} className="hover:bg-ink-50/50">
                <td className="px-5 py-4">
                  <p className="font-medium text-ink-900">{r.name}</p>
                  {r.description && <p className="text-xs text-ink-500 mt-0.5 max-w-md truncate">{r.description}</p>}
                </td>
                <td className="px-5 py-4 capitalize text-ink-700">{r.room_type}</td>
                <td className="px-5 py-4 text-ink-700 tabular-nums">{r.capacity}</td>
                <td className="px-5 py-4"><span className={statusBadge(r.status)}>{r.status}</span></td>
                <td className="px-5 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(r)}   className="btn-secondary">Edit</button>
                  <button onClick={() => onDelete(r.id)} className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="card w-full max-w-lg p-6 relative shadow">
            <button onClick={() => setShowForm(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-md text-ink-500 hover:bg-ink-100">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-semibold text-ink-900 text-lg">{form.id ? 'Edit room' : 'Add room'}</h2>
            <div className="divider my-4" />
            {error && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input name="name" value={form.name} onChange={onChange} required className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select name="roomType" value={form.roomType} onChange={onChange} className="input">
                    {ROOM_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" min="1" name="capacity" value={form.capacity}
                         onChange={onChange} required className="input" />
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" value={form.status} onChange={onChange} className="input">
                  {STATUS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={3} className="input" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{form.id ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageRooms;
