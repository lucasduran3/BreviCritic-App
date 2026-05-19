import 'dotenv/config';
import app from './app.js';
import { config } from './config/env.js';
import pool from './db/pool.js';
import redis from './db/redis.js';

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');

    await redis.ping();
    console.log('Redis connection successful');
    
    app.listen(config.port, () => {
      console.log(`Server is running on port http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

startServer();
