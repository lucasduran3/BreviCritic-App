import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { setAuthCookie } from '../../shared/utils/cookies.js';

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = await authService.register(req.body);
    setAuthCookie(res, token);
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
    const { token } = await authService.login(req.body);
    setAuthCookie(res, token);
    res.json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
}
