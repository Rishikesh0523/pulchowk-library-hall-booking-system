import { useEffect, useState } from 'react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { adminApi } from '../../services/api.js';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Stat = ({ label, value }) => (
  <div className="card p-5">
    <p className="text-xs text-ink-500 uppercase tracking-wide">{label}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(d => setStats(d.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;
  if (!stats) return <Layout><p className="text-ink-500">Failed to load stats.</p></Layout>;

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Admin</h1>
        <p className="text-ink-500 mt-1 text-sm">Overview of users, rooms, and bookings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Users"             value={stats.totalUsers} />
        <Stat label="Rooms"             value={stats.totalRooms} />
        <Stat label="Total bookings"    value={stats.totalBookings} />
        <Stat label="Pending"           value={stats.pendingBookings} />
        <Stat label="Approved"          value={stats.approvedBookings} />
        <Stat label="Cancelled"         value={stats.cancelledBookings} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-ink-900">Top rooms by bookings</h2>
            <Link to="/admin/bookings" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
              All bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {stats.topRooms.length === 0 ? (
            <p className="text-sm text-ink-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {stats.topRooms.map(r => (
                <li key={r.name} className="py-3 flex items-center justify-between">
                  <span className="text-ink-900 text-sm">{r.name}</span>
                  <span className="text-ink-500 text-sm tabular-nums">{r.bookings}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Quick actions</h2>
          <div className="flex flex-col gap-2">
            <Link to="/admin/rooms"    className="btn-primary">Manage rooms</Link>
            <Link to="/admin/bookings" className="btn-secondary">Manage bookings</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
