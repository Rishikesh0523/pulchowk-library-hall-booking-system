require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

const start = async () => {
  let retries = 10;
  while (retries) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      console.warn(
        `Database not ready (${err.code || err.message}); retrying in 3s... (${retries} left)`
      );
      retries -= 1;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  if (!retries) {
    console.error('Database connection failed after retries. Exiting.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://0.0.0.0:${PORT}`);
  });
};

start();
