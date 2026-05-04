import supertest from 'supertest';
import app from '../app.js';
import pool, { adminPool } from '../db/pool.js';
import {
  resetDatabase,
  createTestUser,
  createFollow,
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

  publicUserCookie = await loginAndGetCookie(app, 'publicuser');
  privateUserCookie = await loginAndGetCookie(app, 'privateuser');
  followerCookie = await loginAndGetCookie(app, 'follower');
});

afterAll(async () => {
  await pool.end();
  await adminPool.end();
});

describe('POST /reviews', () => {
  it('returns 201 with the created review', async () => {
    const res = await supertest(app)
      .post('/reviews')
      .set('Cookie', publicUserCookie)
      .send({ movieId: 2, content: 'testing new review', score: 4 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      movieId: 2,
      content: 'testing new review',
      score: 4,
    });
  });

  it('returns 400 with invalid fields', async () => {
    const res = await supertest(app)
      .post('/reviews')
      .set('Cookie', publicUserCookie)
      .send({ movieId: 2, content: 'a', score: 50 });
    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app)
      .post('/reviews')
      .send({ movieId: 2, content: 'testing new review', score: 4 });
    expect(res.status).toBe(401);
  });
});

describe('GET /reviews/:reviewId', () => {
  it('returns the public review to any authenticated user', async () => {
    const res = await supertest(app)
      .get(`/reviews/${publicReviewId}`)
      .set('Cookie', followerCookie);
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('testing public review');
  });

  it('returns 404 if the review does not exist', async () => {
    const res = await supertest(app)
      .get('/reviews/acde070d-8c4c-4f0d-9d8a-162843c10333')
      .set('Cookie', followerCookie);
    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app).get(`/reviews/${publicReviewId}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 when viewing a private review without following the owner', async () => {
    const res = await supertest(app)
      .get(`/reviews/${privateReviewId}`)
      .set('Cookie', followerCookie);
    expect(res.status).toBe(404);
  });
});

describe('GET /profiles/:username/reviews', () => {
  it('returns reviews of a public profile if the requester is authenticated', async () => {
    const res = await supertest(app)
      .get('/profiles/publicuser/reviews')
      .set('Cookie', followerCookie);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      movieId: 4,
      content: 'testing public review',
      score: 4,
    });
  });

  it('returns 403 if the profile is private without following', async () => {
    const res = await supertest(app)
      .get('/profiles/privateuser/reviews')
      .set('Cookie', followerCookie);
    expect(res.status).toBe(403);
  });

  it('returns reviews of a private profile if the requester is following', async () => {
    await createFollow(followerUserId, privateUserId);
    const res = await supertest(app)
      .get('/profiles/privateuser/reviews')
      .set('Cookie', followerCookie);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      movieId: 2,
      content: 'testing private review',
      score: 3,
    });
  });

  it('returns 404 if the profile does not exist', async () => {
    const res = await supertest(app)
      .get('/profiles/nonexistent/reviews')
      .set('Cookie', followerCookie);
    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app).get('/profiles/publicuser/reviews');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /reviews/:reviewId', () => {
  it('update only the submitted fields', async () => {
    const res = await supertest(app)
      .patch(`/reviews/${publicReviewId}`)
      .set('Cookie', publicUserCookie)
      .send({ content: 'updating public review' });
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('updating public review');
    expect(res.body.score).toBe(4);
    expect(res.body.movieId).toBe(4);
  });

  it('returns 400 if the body is empty', async () => {
    const res = await supertest(app)
      .patch(`/reviews/${publicReviewId}`)
      .set('Cookie', publicUserCookie)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 if the review does not exist', async () => {
    const res = await supertest(app)
      .patch('/reviews/acde070d-8c4c-4f0d-9d8a-162843c10333')
      .set('Cookie', publicUserCookie)
      .send({ content: 'does not' });
    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app)
      .patch(`/reviews/${publicReviewId}`)
      .send({ content: 'test' });
    expect(res.status).toBe(401);
  });

  it('returns 404 if the requester is not the owner of the review', async () => {
    const res = await supertest(app)
      .patch(`/reviews/${publicReviewId}`)
      .set('Cookie', followerCookie)
      .send({ content: 'test' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /reviews/:reviewId', () => {
  it('returns 204 if the review is successfully deleted', async () => {
    const res = await supertest(app)
      .delete(`/reviews/${publicReviewId}`)
      .set('Cookie', publicUserCookie);
    expect(res.status).toBe(204);
  });

  it('returns 404 if the review does not exist', async () => {
    const res = await supertest(app)
      .delete('/reviews/acde070d-8c4c-4f0d-9d8a-162843c10333')
      .set('Cookie', followerCookie);
    expect(res.status).toBe(404);
  });

  it('returns 401 without', async () => {
    const res = await supertest(app).delete(`/reviews/${privateReviewId}`);
    expect(res.status).toBe(401);
  });

  it('returns 404 if the requester is not the owner', async () => {
    const res = await supertest(app)
      .delete(`/reviews/${privateReviewId}`)
      .set('Cookie', publicUserCookie);
    expect(res.status).toBe(404);
  });
});
