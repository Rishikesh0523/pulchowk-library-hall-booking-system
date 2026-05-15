import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import { bookingsApi, roomsApi } from '../services/api.js';
import { ChevronLeft, ChevronRight, X, Clock, User as UserIcon } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth   = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const addMonths    = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const isSameDay    = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth() &&
  a.getDate()     === b.getDate();

const fmtTime = (d) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Calendar = () => {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomFilter, setRoomFilter] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  // 6-week grid: start from previous Sunday before month start, total 42 cells
  const gridStart = useMemo(() => {
    const d = new Date(cursor);
    d.setDate(1);
    d.setDate(d.getDate() - d.getDay()); // back to Sunday
    d.setHours(0, 0, 0, 0);
    return d;
  }, [cursor]);

  const gridEnd = useMemo(() => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + 42);
    return d;
  }, [gridStart]);

  const days = useMemo(() => {
    const out = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, [gridStart]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      bookingsApi.calendar(gridStart.toISOString(), gridEnd.toISOString()),
      rooms.length === 0 ? roomsApi.list() : Promise.resolve({ rooms }),
    ])
      .then(([b, r]) => {
        if (!mounted) return;
        setBookings(b.bookings);
        if (rooms.length === 0) setRooms(r.rooms);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  const visibleBookings = useMemo(
    () => bookings.filter((b) => !roomFilter || String(b.room_id) === roomFilter),
    [bookings, roomFilter]
  );

  const bookingsByDay = useMemo(() => {
    const map = new Map();
    for (const b of visibleBookings) {
      // A booking can span days — add it to every day it overlaps inside the grid
      const start = new Date(b.start_time);
      const end   = new Date(b.end_time);
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      while (d <= end) {
        const key = d.toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(b);
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [visibleBookings]);

  const today = new Date();
  const monthLabel = `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Calendar</h1>
          <p className="text-ink-500 mt-1 text-sm">See who has booked which room.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">All rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <div className="inline-flex rounded-md border border-ink-200 bg-white">
            <button
              onClick={() => setCursor(addMonths(cursor, -1))}
              className="p-2 hover:bg-ink-50 text-ink-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCursor(startOfMonth(new Date()))}
              className="px-3 text-sm text-ink-700 hover:bg-ink-50 border-x border-ink-200"
            >
              Today
            </button>
            <button
              onClick={() => setCursor(addMonths(cursor, 1))}
              className="p-2 hover:bg-ink-50 text-ink-700"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium text-ink-900">{monthLabel}</h2>
        <p className="text-xs text-ink-500">
          {visibleBookings.length} booking{visibleBookings.length === 1 ? '' : 's'} this view
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-ink-200 bg-ink-50">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-3 py-2 text-xs font-medium text-ink-500 uppercase tracking-wide text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 grid-rows-6">
            {days.map((d, idx) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = isSameDay(d, today);
              const list = bookingsByDay.get(d.toDateString()) || [];
              const visible = list.slice(0, 3);
              const more = list.length - visible.length;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDay({ date: d, list })}
                  className={`relative text-left min-h-[6rem] sm:min-h-[7rem] border-r border-b border-ink-100 p-2 transition-colors hover:bg-ink-50/60 ${
                    inMonth ? 'bg-white' : 'bg-ink-50/40'
                  } ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''} ${idx >= 35 ? 'border-b-0' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-medium h-6 w-6 rounded-full ${
                        isToday
                          ? 'bg-ink-900 text-white'
                          : inMonth ? 'text-ink-900' : 'text-ink-400'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {list.length > 0 && (
                      <span className="text-[10px] text-ink-400 tabular-nums">{list.length}</span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {visible.map((b) => (
                      <div
                        key={`${b.id}-${idx}`}
                        className={`truncate rounded px-1.5 py-0.5 text-[11px] leading-snug ring-1 ring-inset ${
                          b.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                            : 'bg-amber-50 text-amber-800 ring-amber-200'
                        }`}
                      >
                        <span className="tabular-nums">{fmtTime(new Date(b.start_time))}</span>
                        {' · '}
                        <span className="font-medium">{b.room_name}</span>
                      </div>
                    ))}
                    {more > 0 && (
                      <div className="text-[11px] text-ink-500 pl-1">+{more} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
        </span>
      </div>

      {selectedDay && (
        <DayPanel
          date={selectedDay.date}
          bookings={selectedDay.list}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </Layout>
  );
};

const DayPanel = ({ date, bookings, onClose }) => {
  const label = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const sorted = [...bookings].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/20 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md h-full bg-white border-l border-ink-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-ink-200 flex items-start justify-between">
          <div>
            <p className="text-xs text-ink-500 uppercase tracking-wide">Bookings on</p>
            <h2 className="mt-1 text-lg font-semibold text-ink-900">{label}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-500 hover:bg-ink-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {sorted.length === 0 ? (
            <p className="text-sm text-ink-500">No bookings on this day.</p>
          ) : (
            <ul className="space-y-3">
              {sorted.map((b) => (
                <li key={b.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-900">{b.room_name}</p>
                      <p className="text-xs text-ink-500 capitalize mt-0.5">{b.room_type}</p>
                    </div>
                    <span
                      className={
                        b.status === 'approved' ? 'badge-success' : 'badge-warning'
                      }
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <p className="text-ink-700 inline-flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-ink-400" />
                      {fmtTime(new Date(b.start_time))} – {fmtTime(new Date(b.end_time))}
                    </p>
                    <p className="text-ink-700 inline-flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-ink-400" />
                      {b.user_name}
                    </p>
                    {b.purpose && (
                      <p className="text-xs text-ink-500 italic pt-1">"{b.purpose}"</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
