import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusBadge = (s) =>
  s === 'available' ? 'badge-success' : s === 'maintenance' ? 'badge-warning' : 'badge-danger';

const RoomCard = ({ room, onBook }) => {
  const disabled = room.status !== 'available';
  return (
    <div className="card-hover p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink-900 leading-tight">{room.name}</h3>
          <p className="text-xs text-ink-500 mt-1 capitalize">{room.room_type}</p>
        </div>
        <span className={statusBadge(room.status)}>{room.status}</span>
      </div>

      {room.description && (
        <p className="text-sm text-ink-600 line-clamp-2">{room.description}</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-ink-500">
        <Users className="w-3.5 h-3.5" />
        Capacity {room.capacity}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-ink-100">
        {onBook ? (
          <button disabled={disabled} onClick={() => onBook(room)} className="btn-primary w-full">
            {disabled ? 'Unavailable' : 'Book'}
          </button>
        ) : (
          <Link to={`/book/${room.id}`} className="btn-primary w-full">Book</Link>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
