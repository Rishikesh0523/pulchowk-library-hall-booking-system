const { query } = require('../config/db');

const hasOverlap = async (roomId, startTime, endTime, excludeId = null) => {
  const params = [roomId, startTime, endTime];
  let extra = '';
  if (excludeId) {
    params.push(excludeId);
    extra = ` AND id <> $${params.length}`;
  }
  const result = await query(
    `SELECT 1 FROM bookings
     WHERE room_id = $1
       AND status IN ('pending','approved')
       AND start_time < $3
       AND end_time > $2
       ${extra}
     LIMIT 1`,
    params
  );
  return result.rowCount > 0;
};

const create = async ({ userId, roomId, startTime, endTime, purpose }) => {
  const result = await query(
    `INSERT INTO bookings (user_id, room_id, start_time, end_time, purpose, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [userId, roomId, startTime, endTime, purpose || '']
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await query(
    `SELECT b.*, r.name AS room_name, r.room_type, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN users u ON u.id = b.user_id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0];
};

const listByUser = async (userId) => {
  const result = await query(
    `SELECT b.*, r.name AS room_name, r.room_type
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     WHERE b.user_id = $1
     ORDER BY b.start_time DESC`,
    [userId]
  );
  return result.rows;
};

const listInRange = async (startTime, endTime) => {
  const result = await query(
    `SELECT b.id, b.start_time, b.end_time, b.status, b.purpose,
            r.id AS room_id, r.name AS room_name, r.room_type,
            u.id AS user_id, u.name AS user_name
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN users u ON u.id = b.user_id
     WHERE b.status IN ('pending','approved')
       AND b.start_time < $2
       AND b.end_time   > $1
     ORDER BY b.start_time ASC`,
    [startTime, endTime]
  );
  return result.rows;
};

const listAll = async () => {
  const result = await query(
    `SELECT b.*, r.name AS room_name, r.room_type,
            u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN rooms r ON r.id = b.room_id
     JOIN users u ON u.id = b.user_id
     ORDER BY b.start_time DESC`
  );
  return result.rows;
};

const updateStatus = async (id, status) => {
  const result = await query(
    `UPDATE bookings SET status = $2, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0];
};

const stats = async () => {
  const totalUsers = await query(`SELECT COUNT(*)::int AS c FROM users`);
  const totalRooms = await query(`SELECT COUNT(*)::int AS c FROM rooms`);
  const totalBookings = await query(`SELECT COUNT(*)::int AS c FROM bookings`);
  const pending = await query(
    `SELECT COUNT(*)::int AS c FROM bookings WHERE status='pending'`
  );
  const approved = await query(
    `SELECT COUNT(*)::int AS c FROM bookings WHERE status='approved'`
  );
  const cancelled = await query(
    `SELECT COUNT(*)::int AS c FROM bookings WHERE status='cancelled'`
  );
  const topRooms = await query(
    `SELECT r.name, COUNT(b.id)::int AS bookings
     FROM rooms r LEFT JOIN bookings b ON b.room_id = r.id
     GROUP BY r.id, r.name
     ORDER BY bookings DESC
     LIMIT 5`
  );
  return {
    totalUsers: totalUsers.rows[0].c,
    totalRooms: totalRooms.rows[0].c,
    totalBookings: totalBookings.rows[0].c,
    pendingBookings: pending.rows[0].c,
    approvedBookings: approved.rows[0].c,
    cancelledBookings: cancelled.rows[0].c,
    topRooms: topRooms.rows,
  };
};

module.exports = {
  hasOverlap,
  create,
  findById,
  listByUser,
  listInRange,
  listAll,
  updateStatus,
  stats,
};
