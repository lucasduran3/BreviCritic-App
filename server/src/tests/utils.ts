import { App } from 'supertest/types.js';
import { adminPool } from '../db/pool.js';
import redis from '../db/redis.js';
import supertest from 'supertest';

export async function resetDatabase() {
  await adminPool.query('DELETE FROM app.notifications');
  await adminPool.query('DELETE FROM app.follows');
  await adminPool.query('DELETE FROM app.reviews_reaction');
  await adminPool.query('DELETE FROM auth.users');
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

  const client = await adminPool.connect();
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
  await adminPool.query(
    'INSERT INTO app.follows (follower_id, followed_id) VALUES ($1, $2)',
    [followerId, followedId],
  );
}

export async function loginAndGetCookie(
  app: App,
  identifier: string,
): Promise<string> {
  const response = await supertest(app).post('/auth/login').send({
    identifier,
    password: 'password123',
  });
  const cookie = response.headers['set-cookie'];
  if (!cookie) throw new Error(`Login failed for ${identifier}`);
  return Array.isArray(cookie) ? cookie[0] : cookie;
}

export async function createReview(
  userId: string,
  movieId: number,
  content: string,
  score: number,
): Promise<string> {
  const result = await adminPool.query(
    'INSERT INTO app.reviews(user_id, movie_id, content, score) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, movieId, content, score],
  );

  return result.rows[0].id;
}

export async function createReaction(
  userId: string,
  reviewId: string,
  type: 'like' | 'dislike',
): Promise<void> {
  await adminPool.query(
    'INSERT INTO app.reviews_reaction(user_id, review_id, type) VALUES ($1, $2, $3)',
    [userId, reviewId, type],
  );
}

export async function resetRedis() {
  const keys = await redis.keys('refresh_token:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
