import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import { bookingsApi } from '../services/api.js';
import { Link } from 'react-router-dom';

const statusBadge = (s) => ({
  pending: 'badge-warning', approved: 'badge-success',
  rejected: 'badge-danger', cancelled: 'badge-muted',
}[s] || 'badge-muted');

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    bookingsApi.mine()
      .then(d => setBookings(d.bookings))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const onCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setBusy(id);
    try { await bookingsApi.cancel(id); load(); }
    finally { setBusy(null); }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">My bookings</h1>
          <p className="text-ink-500 mt-1 text-sm">All your past and upcoming reservations.</p>
        </div>
        <Link to="/rooms" className="btn-primary">Book a room</Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-ink-500">No bookings yet.</p>
          <Link to="/rooms" className="btn-primary mt-4 inline-flex">Browse rooms</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-ink-500 uppercase tracking-wide bg-ink-50 border-b border-ink-200">
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Date & time</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-ink-50/50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-900">{b.room_name}</p>
                    <p className="text-xs text-ink-500 capitalize mt-0.5">{b.room_type}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-700">
                    {new Date(b.start_time).toLocaleString()}
                    <p className="text-xs text-ink-500 mt-0.5">to {new Date(b.end_time).toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-600 max-w-xs truncate">{b.purpose || '—'}</td>
                  <td className="px-5 py-4"><span className={statusBadge(b.status)}>{b.status}</span></td>
                  <td className="px-5 py-4 text-right">
                    {(b.status === 'pending' || b.status === 'approved') ? (
                      <button onClick={() => onCancel(b.id)} disabled={busy === b.id}
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

export default MyBookings;
