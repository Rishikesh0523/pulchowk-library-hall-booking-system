import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import RoomCard from '../components/RoomCard.jsx';
import { roomsApi } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';

const ROOM_TYPES = ['reading', 'study', 'conference', 'discussion', 'lab', 'auditorium'];

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    roomType: '', minCapacity: '', startTime: '', endTime: '', q: '',
  });

  const fetchRooms = async () => {
    setLoading(true);
    const params = {};
    if (filters.roomType)    params.roomType = filters.roomType;
    if (filters.minCapacity) params.minCapacity = filters.minCapacity;
    if (filters.startTime && filters.endTime) {
      params.startTime = new Date(filters.startTime).toISOString();
      params.endTime   = new Date(filters.endTime).toISOString();
    }
    try {
      const data = await roomsApi.list(params);
      setRooms(data.rooms);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const onSubmit = (e) => { e.preventDefault(); fetchRooms(); };
  const onReset  = () => {
    setFilters({ roomType: '', minCapacity: '', startTime: '', endTime: '', q: '' });
    setTimeout(fetchRooms, 0);
  };

  const visible = rooms.filter(r =>
    filters.q ? r.name.toLowerCase().includes(filters.q.toLowerCase()) : true
  );

  const handleBook = (room) => {
    const p = new URLSearchParams();
    if (filters.startTime) p.set('start', filters.startTime);
    if (filters.endTime)   p.set('end',   filters.endTime);
    navigate(`/book/${room.id}?${p.toString()}`);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Rooms</h1>
        <p className="text-ink-500 mt-1 text-sm">Browse and reserve available spaces.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            name="q" value={filters.q} onChange={onChange}
            className="input pl-9" placeholder="Search rooms…"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <form onSubmit={onSubmit} className="card p-5 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Type</label>
              <select name="roomType" value={filters.roomType} onChange={onChange} className="input">
                <option value="">Any</option>
                {ROOM_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min capacity</label>
              <input type="number" min="1" name="minCapacity" value={filters.minCapacity}
                     onChange={onChange} className="input" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="label">Available from</label>
              <input type="datetime-local" name="startTime" value={filters.startTime}
                     onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Until</label>
              <input type="datetime-local" name="endTime" value={filters.endTime}
                     onChange={onChange} className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn-ghost" onClick={onReset}>Reset</button>
            <button type="submit" className="btn-primary">Apply filters</button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-ink-500">No rooms match your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-500 mb-3">{visible.length} {visible.length === 1 ? 'room' : 'rooms'}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(room => <RoomCard key={room.id} room={room} onBook={handleBook} />)}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Rooms;
