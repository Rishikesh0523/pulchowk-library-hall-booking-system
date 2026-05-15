import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { bookingsApi } from '../../services/api.js';

const statusBadge = (s) => ({
  pending: 'badge-warning', approved: 'badge-success',
  rejected: 'badge-danger', cancelled: 'badge-muted',
}[s] || 'badge-muted');

const FILTERS = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    bookingsApi.listAll().then(d => setBookings(d.bookings)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setBusy(id);
    try { await bookingsApi.setStatus(id, status); load(); }
    finally { setBusy(null); }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Manage bookings</h1>
        <p className="text-ink-500 mt-1 text-sm">Approve, reject, or cancel any booking.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
              filter === s
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card p-16 text-center"><p className="text-ink-500">No bookings.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-ink-500 uppercase tracking-wide bg-ink-50 border-b border-ink-200">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {visible.map(b => (
                <tr key={b.id} className="hover:bg-ink-50/50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900">{b.user_name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{b.user_email}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {b.room_name}
                    <p className="text-xs text-ink-500 capitalize mt-0.5">{b.room_type}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {new Date(b.start_time).toLocaleString()}
                    <p className="text-xs text-ink-500 mt-0.5">to {new Date(b.end_time).toLocaleString()}</p>
                    {b.purpose && <p className="text-xs text-ink-500 mt-1 italic max-w-xs truncate">{b.purpose}</p>}
                  </td>
                  <td className="px-5 py-4"><span className={statusBadge(b.status)}>{b.status}</span></td>
                  <td className="px-5 py-4 text-right">
                    {b.status === 'pending' ? (
                      <div className="inline-flex gap-2">
                        <button disabled={busy === b.id} onClick={() => updateStatus(b.id, 'approved')}
                                className="btn-primary">Approve</button>
                        <button disabled={busy === b.id} onClick={() => updateStatus(b.id, 'rejected')}
                                className="btn-danger">Reject</button>
                      </div>
                    ) : b.status === 'approved' ? (
                      <button disabled={busy === b.id} onClick={() => updateStatus(b.id, 'cancelled')}
                              className="btn-secondary">Cancel</button>
                    ) : <span className="text-xs text-ink-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default ManageBookings;
