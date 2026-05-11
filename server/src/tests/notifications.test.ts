import supertest from 'supertest';
import app from '../app.js';
import pool, { adminPool } from '../db/pool.js';
import {
  resetDatabase,
  createTestUser,
  createFollow,
  createReaction,
  createReview,
  loginAndGetCookie,
} from './utils.js';

let publicUserId: string;
let privateUserId: string;
let followerUserId: string;

let privateReviewId: string;
let publicReviewId: string;

let publicUserCookie: string;
let privateUserCookie: string;
let followerCookie: string;

beforeEach(async () => {
  await resetDatabase();

  publicUserId = await createTestUser({
    username: 'publicuser',
    email: 'public@example.com',
    name: 'Public',
    lastname: 'User',
    country: 'Argentina',
    city: 'BuenosAires',
    isPublic: true,
  });

  privateUserId = await createTestUser({
    username: 'privateuser',
    email: 'private@example.com',
    name: 'Private',
    lastname: 'User',
    country: 'Argentina',
    city: 'Rosario',
    isPublic: false,
  });

  followerUserId = await createTestUser({
    username: 'follower',
    email: 'follower@example.com',
    isPublic: true,
  });

  publicReviewId = await createReview(
    publicUserId,
    4,
    'testing public review',
    4,
  );
  privateReviewId = await createReview(
    privateUserId,
    2,
    'testing private review',
    3,
  );

  await createFollow(followerUserId, publicUserId);
  await createReaction(followerUserId, publicReviewId, 'like');

  publicUserCookie = await loginAndGetCookie(app, 'publicuser');
  privateUserCookie = await loginAndGetCookie(app, 'privateuser');
  followerCookie = await loginAndGetCookie(app, 'follower');
});

afterAll(async () => {
  await pool.end();
  await adminPool.end();
});

describe('GET/ notifications', () => {
  it('should return notifications for the user', async () => {
    const response = await supertest(app)
      .get('/notifications')
      .set('Cookie', publicUserCookie);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return filtered unread notifications for the user', async () => {
    const response = await supertest(app)
      .get('/notifications')
      .query({ isRead: false })
      .set('Cookie', publicUserCookie);

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.every((n: any) => n.isRead === false)).toBe(true);
  });

  it('should not return notifications for other users', async () => {
    const response = await supertest(app)
      .get('/notifications')
      .set('Cookie', privateUserCookie);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('should return 401 without authentication', async () => {
    await supertest(app).get('/notifications').expect(401);
  });
});
