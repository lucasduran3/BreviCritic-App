import { JWTPayload } from '../../modules/auth/auth.types.js';
import { config } from '../../config/env.js';
import jwt, { SignOptions } from 'jsonwebtoken';
import redis from '../../db/redis.js';
import crypto from 'crypto';

export function generateAccessToken(userId: string): string {
  const payload: JWTPayload = { sub: userId };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });
}

// generar refresh token opaco
export async function generateRefreshToken(userId: string): Promise<string> {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  await redis.set(
    `refresh_token:${refreshToken}`,
    userId,
    'EX',
    7 * 24 * 60 * 60,
  );

  return refreshToken;
}

export async function rotateRefreshToken(
  oldToken: string,
  userId: string,
): Promise<string> {
  await redis.del(`refresh_token:${oldToken}`);
  return generateRefreshToken(userId);
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await redis.del(`refresh_token:${token}`);
}

export async function verifyRefreshToken(
  token: string,
): Promise<string | null> {
  const userId = await redis.get(`refresh_token:${token}`);
  return userId;
}
