import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import { roomsApi, bookingsApi } from '../services/api.js';
import { ArrowLeft } from 'lucide-react';

const toLocalInputValue = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const BookingForm = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    roomId: roomId || '',
    startTime: toLocalInputValue(searchParams.get('start')),
    endTime: toLocalInputValue(searchParams.get('end')),
    purpose: '',
  });

  useEffect(() => {
    roomsApi.list()
      .then((data) => setRooms(data.rooms.filter(r => r.status === 'available')))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.roomId) return setError('Please select a room.');
    if (!form.startTime || !form.endTime) return setError('Please pick start and end times.');
    const start = new Date(form.startTime);
    const end   = new Date(form.endTime);
    if (start < new Date()) return setError('Cannot book in the past.');
    if (end <= start)       return setError('End time must be after start time.');

    setSubmitting(true);
    try {
      await bookingsApi.create({
        roomId: parseInt(form.roomId, 10),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: form.purpose,
      });
      setSuccess('Booking submitted. Redirecting…');
      setTimeout(() => navigate('/my-bookings'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  const selected = rooms.find(r => String(r.id) === String(form.roomId));

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">Book a room</h1>
          <p className="text-sm text-ink-500 mt-1">All bookings require admin approval.</p>

          {error && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Room</label>
              <select name="roomId" value={form.roomId} onChange={onChange} className="input" required>
                <option value="">Select a room…</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.room_type} (cap {r.capacity})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Start</label>
                <input type="datetime-local" name="startTime" value={form.startTime}
                       onChange={onChange} className="input" required />
              </div>
              <div>
                <label className="label">End</label>
                <input type="datetime-local" name="endTime" value={form.endTime}
                       onChange={onChange} className="input" required />
              </div>
            </div>
            <div>
              <label className="label">Purpose (optional)</label>
              <textarea name="purpose" value={form.purpose} onChange={onChange} rows={3}
                        className="input" placeholder="e.g. Group study, project meeting…" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting…' : 'Submit booking'}
              </button>
            </div>
          </form>
        </div>

        <aside className="card p-6">
          <h2 className="font-semibold text-ink-900 text-sm">Summary</h2>
          <div className="divider my-4" />
          {selected ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Room</dt>
                <dd className="text-ink-900 font-medium text-right">{selected.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Type</dt>
                <dd className="text-ink-700 capitalize">{selected.room_type}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Capacity</dt>
                <dd className="text-ink-700">{selected.capacity}</dd>
              </div>
              {form.startTime && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">From</dt>
                  <dd className="text-ink-700 text-right">{new Date(form.startTime).toLocaleString()}</dd>
                </div>
              )}
              {form.endTime && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-500">To</dt>
                  <dd className="text-ink-700 text-right">{new Date(form.endTime).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-ink-500">Pick a room to see details.</p>
          )}
        </aside>
      </div>
    </Layout>
  );
};

export default BookingForm;
