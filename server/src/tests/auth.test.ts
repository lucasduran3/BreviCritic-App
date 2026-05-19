import supertest from 'supertest';
import app from '../app.js';
import pool from '../db/pool.js';
import redis from '../db/redis.js';
import { createTestUser, resetDatabase, resetRedis } from './utils.js';

beforeEach(async () => {
  await resetDatabase();
  await resetRedis();
  await createTestUser({
    username: 'authUser',
    email: 'auth@example.com',
    name: 'Auth',
    lastname: 'User',
    country: 'Chile',
    city: 'Santiago de Chile',
    isPublic: true,
  });
});

afterAll(async () => {
  await pool.end();
  await redis.quit();
});

describe('POST /auth/refresh', () => {
  it('returns new tokens when refresh token is valid', async () => {
    const loginResponse = await supertest(app).post('/auth/login').send({
      identifier: 'authUser',
      password: 'password123',
    });

    const cookies = loginResponse.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies)
      ? cookies
      : cookies
        ? [cookies]
        : [];

    const refreshTokenCookie = cookieArray.find((cookie) =>
      cookie.startsWith('refreshToken='),
    );
    const refreshToken = refreshTokenCookie
      ? refreshTokenCookie.split(';')[0].split('=')[1]
      : null;

    expect(refreshToken).toBeTruthy();

    const refreshResponse = await supertest(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('message', 'Tokens refreshed');
    expect(refreshResponse.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 when refresh token is missing', async () => {
    const res = await supertest(app).post('/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Refresh token missing');
  });

  it('returns 401 when refresh token is invalid', async () => {
    const res = await supertest(app)
      .post('/auth/refresh')
      .set('Cookie', 'refreshToken=invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid refresh token');
  });

  it('old refresh token is invalidated after rotation', async () => {
    const loginResponse = await supertest(app).post('/auth/login').send({
      identifier: 'authUser',
      password: 'password123',
    });

    //post /auth/refresh con el refresh token obtenido
    const cookies = loginResponse.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies)
      ? cookies
      : cookies
        ? [cookies]
        : [];
    const refreshTokenCookie = cookieArray.find((cookie) =>
      cookie.startsWith('refreshToken='),
    );
    const refreshToken = refreshTokenCookie
      ? refreshTokenCookie.split(';')[0].split('=')[1]
      : null;
    expect(refreshToken).toBeTruthy();

    const refreshResponse = await supertest(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('message', 'Tokens refreshed');
    expect(refreshResponse.headers['set-cookie']).toBeDefined();

    //intentar usar el mismo refresh token nuevamente
    const secondRefreshResponse = await supertest(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(secondRefreshResponse.status).toBe(401);
    expect(secondRefreshResponse.body).toHaveProperty(
      'message',
      'Invalid refresh token',
    );
  });
});

describe('POST /auth/logout', () => {
  it('clears cookies and revokes refresh token', async () => {
    const loginResponse = await supertest(app).post('/auth/login').send({
      identifier: 'authUser',
      password: 'password123',
    });

    const cookies = loginResponse.headers['set-cookie'];
    const cookieArray = Array.isArray(cookies)
      ? cookies
      : cookies
        ? [cookies]
        : [];
    const refreshTokenCookie = cookieArray.find((cookie) =>
      cookie.startsWith('refreshToken='),
    );
    const refreshToken = refreshTokenCookie
      ? refreshTokenCookie.split(';')[0].split('=')[1]
      : null;
    expect(refreshToken).toBeTruthy();

    const logoutResponse = await supertest(app)
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(logoutResponse.status).toBe(204);
    expect(logoutResponse.headers['set-cookie']).toBeDefined();

    const secondRefreshResponse = await supertest(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);
    expect(secondRefreshResponse.status).toBe(401);
    expect(secondRefreshResponse.body).toHaveProperty(
      'message',
      'Invalid refresh token',
    );
  });
});

// Test the /auth/register endpoint
/*describe('POST /auth/register', () => {
  it('should register a new user and return a token', async () => {
    const response = await supertest(app).post('/auth/register').send({
      username: 'testuser2',
      name: 'Test User 2',
      lastname: 'User2',
      country: 'Testland2',
      city: 'Testville2',
      isPublic: true,
      email: 'testuser2@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      'message',
      'User registered successfully',
    );
    expect(response.headers['set-cookie']).toBeDefined();
  });
});

// Test the /auth/login endpoint
describe('POST /auth/login', () => {
  it('should log in an existing user and return a token', async () => {
    const response = await supertest(app).post('/auth/login').send({
      identifier: 'testuser',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await supertest(app).post('/auth/login').send({
      identifier: 'testuser',
      password: 'wrongpassword',
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});*/
