import supertest from 'supertest';
import app from '../app.js';
import pool from '../db/pool.js';
import { createTestUser, resetDatabase } from './utils.js';

beforeEach(async () => {
  await resetDatabase();
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
});

// Test the /auth/register endpoint
describe('POST /auth/register', () => {
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
});
