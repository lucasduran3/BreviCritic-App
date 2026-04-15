import 'dotenv/config';
import app from './app.js';
import { config } from './config/env.js';
import pool from './db/pool.js';

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

app.listen(config.port, () => {
    console.log(`Server is running on port http://localhost:${config.port}`);
});