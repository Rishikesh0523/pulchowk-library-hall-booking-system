const { query } = require('../config/db');

const list = async ({ roomType, minCapacity } = {}) => {
  const conditions = [];
  const params = [];
  if (roomType) {
    params.push(roomType);
    conditions.push(`room_type = $${params.length}`);
  }
  if (minCapacity) {
    params.push(minCapacity);
    conditions.push(`capacity >= $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT * FROM rooms ${where} ORDER BY name ASC`,
    params
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await query('SELECT * FROM rooms WHERE id = $1', [id]);
  return result.rows[0];
};

const create = async ({ name, roomType, capacity, description, status }) => {
  const result = await query(
    `INSERT INTO rooms (name, room_type, capacity, description, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, roomType, capacity, description || '', status || 'available']
  );
  return result.rows[0];
};

const update = async (id, fields) => {
  const allowed = ['name', 'room_type', 'capacity', 'description', 'status'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (!sets.length) return findById(id);
  params.push(id);
  const result = await query(
    `UPDATE rooms SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0];
};

const remove = async (id) => {
  await query('DELETE FROM rooms WHERE id = $1', [id]);
};

const findAvailable = async ({ startTime, endTime, minCapacity, roomType }) => {
  const params = [startTime, endTime];
  let extra = '';
  if (minCapacity) {
    params.push(minCapacity);
    extra += ` AND r.capacity >= $${params.length}`;
  }
  if (roomType) {
    params.push(roomType);
    extra += ` AND r.room_type = $${params.length}`;
  }
  const result = await query(
    `SELECT r.* FROM rooms r
     WHERE r.status = 'available'
       ${extra}
       AND NOT EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.room_id = r.id
           AND b.status IN ('pending','approved')
           AND b.start_time < $2
           AND b.end_time > $1
       )
     ORDER BY r.name ASC`,
    params
  );
  return result.rows;
};

module.exports = { list, findById, create, update, remove, findAvailable };
