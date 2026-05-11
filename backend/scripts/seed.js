require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('../src/config/db');

const sampleRooms = [
  {
    name: 'Reading Hall A',
    room_type: 'reading',
    capacity: 50,
    description: 'Quiet reading hall with natural lighting.',
    status: 'available',
  },
  {
    name: 'Study Room B',
    room_type: 'study',
    capacity: 8,
    description: 'Small group study room with whiteboard.',
    status: 'available',
  },
  {
    name: 'Conference Hall',
    room_type: 'conference',
    capacity: 100,
    description: 'Large conference hall with projector and audio system.',
    status: 'available',
  },
  {
    name: 'Discussion Room',
    room_type: 'discussion',
    capacity: 12,
    description: 'Round table discussion room for collaborative work.',
    status: 'available',
  },
  {
    name: 'Computer Lab',
    room_type: 'lab',
    capacity: 30,
    description: 'Computers with development tools and internet.',
    status: 'available',
  },
  {
    name: 'Auditorium',
    room_type: 'auditorium',
    capacity: 200,
    description: 'Large auditorium for events and lectures.',
    status: 'maintenance',
  },
];

const run = async () => {
  try {
    console.log('Seeding database...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@library.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await query('SELECT id FROM users WHERE email = $1', [
      adminEmail,
    ]);
    if (existing.rowCount === 0) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')`,
        ['Administrator', adminEmail, hash]
      );
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log('Admin user already exists. Skipping.');
    }

    const roomCount = await query('SELECT COUNT(*)::int AS c FROM rooms');
    if (roomCount.rows[0].c === 0) {
      for (const r of sampleRooms) {
        await query(
          `INSERT INTO rooms (name, room_type, capacity, description, status)
           VALUES ($1,$2,$3,$4,$5)`,
          [r.name, r.room_type, r.capacity, r.description, r.status]
        );
      }
      console.log(`Inserted ${sampleRooms.length} sample rooms.`);
    } else {
      console.log('Rooms already exist. Skipping sample data.');
    }

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
