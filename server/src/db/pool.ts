import { config } from '../config/env.js';
import { Pool } from 'pg';

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

export const adminPool = new Pool({
  user: config.db.superUser,
  password: config.db.superPassword,
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
})

export default pool;
