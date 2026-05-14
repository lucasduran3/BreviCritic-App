import { Response } from 'express';
import { config } from '../../config/env.js';

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, cookieOptions);
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('token', cookieOptions);
}

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
