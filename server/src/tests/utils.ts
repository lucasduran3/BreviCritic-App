import { App } from 'supertest/types.js';
import pool from '../db/pool.js';

export async function resetDatabase() {
  await pool.query(`
    DELETE FROM app.profiles;
    DELETE FROM app.reviews;
    DELETE FROM app.follows;
  `);
}

interface CreateTestUserOptions {
  username: string;
  email: string;
  name?: string;
  lastname?: string;
  country?: string;
  city?: string;
  isPublic?: boolean;
}

const PASSWORD_HASH =
  '$2a$12$u6T0W6vdJJGxrM2Q5CYwu.jolXWJIBshi8Fq8EtppyLSSPu3bofdi';

export async function createTestUser(
  options: CreateTestUserOptions,
): Promise<string> {
  const {
    username,
    email,
    name = 'Test',
    lastname = 'User',
    country = 'Testland',
    city = 'Testville',
    isPublic = true,
  } = options;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertAuthSQL = `SELECT auth.register_user($1, $2) AS id`;
    const authResult = await client.query(insertAuthSQL, [
      email,
      PASSWORD_HASH,
    ]);
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
    return userId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function createFollow(
  followerId: string,
  followedId: string,
): Promise<void> {
  await pool.query(
    'INSERT INTO app.follows (follower_id, followed_id) VALUES ($1, $2)',
    [followerId, followedId],
  );
}

export async function loginAndGetCookie(
  app: App,
  identifier: string,
): Promise<string> {
  const supertest = (await import('supertest')).default;
  const response = await supertest(app).post('/auth/login').send({
    identifier,
    password: 'password123',
  });
  const cookie = response.headers['set-cookie'];
  if (!cookie) throw new Error(`Login failed for ${identifier}`);
  return Array.isArray(cookie) ? cookie[0] : cookie;
}
