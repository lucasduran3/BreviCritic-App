import pool from '../db/pool.js';

export async function resetDatabase() {
  await pool.query(`
    DELETE FROM app.profiles;
    DELETE FROM auth.users;
  `);
}

export async function createTestUser() {
  const email = 'testuser@example.com';
  const passwordHash =
    '$2a$12$u6T0W6vdJJGxrM2Q5CYwu.jolXWJIBshi8Fq8EtppyLSSPu3bofdi'; // bcrypt hash for "password123"
  const username = 'testuser';
  const name = 'Test User';
  const lastname = 'User';
  const country = 'Testland';
  const city = 'Testville';
  const isPublic = true;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertAuthSQL = `INSERT INTO auth.users (email, password_hash) VALUES ($1, $2) RETURNING id`;
    const authResult = await client.query(insertAuthSQL, [email, passwordHash]);
    const userId = authResult.rows[0].id;

    const insertProfileSQL = `INSERT INTO app.profiles (id, username, name, lastname, country, city, profile_photo, is_public)
                                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    await client.query(insertProfileSQL, [
      userId,
      username,
      name,
      lastname,
      country,
      city,
      null,
      isPublic,
    ]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
