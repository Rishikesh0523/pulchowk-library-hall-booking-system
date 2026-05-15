import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingsApi, roomsApi } from '../services/api.js';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Stat = ({ label, value }) => (
  <div className="card p-5">
    <p className="text-xs text-ink-500 uppercase tracking-wide">{label}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
  </div>
);

const statusBadge = (s) => ({
  pending: 'badge-warning', approved: 'badge-success',
  rejected: 'badge-danger', cancelled: 'badge-muted',
}[s] || 'badge-muted');

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([bookingsApi.mine(), roomsApi.list()])
      .then(([b, r]) => {
        if (!mounted) return;
        setBookings(b.bookings);
        setRooms(r.rooms);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <Layout><Spinner /></Layout>;

  const upcoming = bookings.filter(b => new Date(b.start_time) >= new Date() && b.status !== 'cancelled');
  const approved = bookings.filter(b => b.status === 'approved');
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  return (
    <Layout>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Welcome, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-ink-500 mt-1 text-sm">Here's a summary of your activity.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Rooms available" value={availableRooms} />
        <Stat label="Your bookings"   value={bookings.length} />
        <Stat label="Upcoming"        value={upcoming.length} />
        <Stat label="Approved"        value={approved.length} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-ink-900">Upcoming bookings</h2>
            <Link to="/my-bookings" className="text-sm text-ink-600 hover:text-ink-900 inline-flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-500">
              No upcoming bookings.{' '}
              <Link to="/rooms" className="text-ink-900 hover:underline">Browse rooms →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {upcoming.slice(0, 5).map((b) => (
                <li key={b.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900 text-sm">{b.room_name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {new Date(b.start_time).toLocaleString()}
                    </p>
                  </div>
                  <span className={statusBadge(b.status)}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Quick actions</h2>
          <div className="flex flex-col gap-2">
            <Link to="/rooms"       className="btn-primary">Browse rooms</Link>
            <Link to="/calendar"    className="btn-secondary">View calendar</Link>
            <Link to="/my-bookings" className="btn-ghost">My bookings</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
