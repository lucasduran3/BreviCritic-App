import express from 'express';
import pool from '../db/pool.js';

const router: express.Router = express.Router();

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Database connection error:', error);
    res
      .status(500)
      .json({ status: 'error', message: 'Database connection failed' });
  }
});

export default router;
