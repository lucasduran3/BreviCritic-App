import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import {
  clearAuthCookies,
  setAuthCookies,
} from '../../shared/utils/cookies.js';

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { accessToken, refreshToken } = await authService.register(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }
    await authService.logout(refreshToken);
    clearAuthCookies(res);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshTokens(refreshToken);
    setAuthCookies(res, accessToken, newRefreshToken);
    res.json({ message: 'Tokens refreshed' });
  } catch (error) {
    next(error);
  }
}
