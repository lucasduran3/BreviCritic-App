import supertest from 'supertest';
import app from '../app.js';
import pool from '../db/pool.js';
import {
  resetDatabase,
  createTestUser,
  createFollow,
  loginAndGetCookie,
} from './utils.js';

let publicUserId: string;
let privateUserId: string;
let followerUserId: string;

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

  publicUserCookie = await loginAndGetCookie(app, 'publicuser');
  privateUserCookie = await loginAndGetCookie(app, 'privateuser');
  followerCookie = await loginAndGetCookie(app, 'follower');
});

afterAll(async () => {
  await pool.end();
});

describe('GET/profiles/me', () => {
  it('returns own profile', async () => {
    const res = await supertest(app)
      .get('/profiles/me')
      .set('Cookie', publicUserCookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      username: 'publicuser',
      name: 'Public',
      country: 'Argentina',
    });
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app).get('/profiles/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH/profiles/me', () => {
  it('update only the submitted fields', async () => {
    const res = await supertest(app)
      .patch('/profiles/me')
      .set('Cookie', publicUserCookie)
      .send({ city: 'Cordoba' });

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('Cordoba');
    expect(res.body.country).toBe('Argentina');
    expect(res.body.username).toBe('publicuser');
  });

  it('uptade multiple fields at the same time', async () => {
    const res = await supertest(app)
      .patch('/profiles/me')
      .set('Cookie', publicUserCookie)
      .send({ name: 'Nuevo', lastname: 'Nombre', isPublic: false });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Nuevo',
      lastname: 'Nombre',
      isPublic: false,
    });
  });

  it('returns 400 if the body is empty', async () => {
    const res = await supertest(app)
      .patch('/profiles/me')
      .set('Cookie', publicUserCookie)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 with invalid fields', async () => {
    const res = await supertest(app)
      .patch('/profiles/me')
      .set('Cookie', publicUserCookie)
      .send({ username: 'ab' });

    expect(res.status).toBe(400);
  });

  it('returns 409 if the username already exists', async () => {
    const res = await supertest(app)
      .patch('/profiles/me')
      .set('Cookie', publicUserCookie)
      .send({ username: 'privateuser' });

    expect(res.status).toBe(409);
  });
});

describe('GET profiles/:username', () => {
  it('returns the public profile to any authenticated user', async () => {
    const res = await supertest(app)
      .get('/profiles/publicuser')
      .set('Cookie', followerCookie);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('publicuser');
  });

  it('returns 403 when viewing a private profile without following it', async () => {
    const res = await supertest(app)
      .get('/profiles/privateuser')
      .set('Cookie', followerCookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('This profile is private');
  });

  it('returns the private profile if you follow it - RLS', async () => {
    await createFollow(followerUserId, privateUserId);

    const res = await supertest(app)
      .get('/profiles/privateuser')
      .set('Cookie', followerCookie);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('privateuser');
  });

  it('the owner can see his own private profile', async () => {
    const res = await supertest(app)
      .get('/profiles/privateuser')
      .set('Cookie', privateUserCookie);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('privateuser');
  });

  it('returns 404 due to a non-existent username', async () => {
    const res = await supertest(app)
      .get('/profiles/non-existent')
      .set('Cookie', followerCookie);

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app).get('/profiles/publicuser');
    expect(res.status).toBe(401);
  });
});

describe('GET /profiles (search)', () => {
  it('returns all profiles include private', async () => {
    const res = await supertest(app)
      .get('/profiles')
      .set('Cookie', followerCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const username = res.body.map((p: { username: string }) => p.username);
    expect(username).toContain('publicuser');
    expect(username).toContain('privateuser');
    expect(username).toContain('follower');

    res.body.forEach((p: Record<string, unknown>) => {
      expect(Object.keys(p).sort()).toEqual(
        ['id', 'profilePhotoUrl', 'username'].sort(),
      );
    });
  });

  it('filter by partial username search', async () => {
    const res = await supertest(app)
      .get('/profiles?search=priv')
      .set('Cookie', followerCookie);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].username).toBe('privateuser');
  });

  it('respects limit and offset', async () => {
    const resLimit = await supertest(app)
      .get('/profiles?limit=2&offset=0')
      .set('Cookie', followerCookie);

    expect(resLimit.status).toBe(200);
    expect(resLimit.body.length).toBeLessThanOrEqual(2);

    const resOffset = await supertest(app)
      .get('/profiles?limit=2&offset=2')
      .set('Cookie', followerCookie);

    expect(resOffset.status).toBe(200);
    expect(resOffset.body).not.toEqual(resLimit.body);
  });

  it('returns 401 without token', async () => {
    const res = await supertest(app).get('/profiles');
    expect(res.status).toBe(401);
  });
});
