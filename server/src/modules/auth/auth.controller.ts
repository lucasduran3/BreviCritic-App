import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { config } from '../../config/env.js';

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = await authService.register(req.body);
    res.cookie('token', token, {
      httpOnly: true,
      secure:config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
}
