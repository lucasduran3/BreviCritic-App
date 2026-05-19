import { Response } from 'express';
import { config } from '../../config/env.js';

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie('token', accessToken, accesTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('token', accesTokenCookieOptions);
  res.clearCookie('refreshToken', refreshTokenCookieOptions);
}

const baseOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
};

export const accesTokenCookieOptions = {
  ...baseOptions,
  maxAge: 15 * 60 * 1000,
};

export const refreshTokenCookieOptions = {
  ...baseOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
