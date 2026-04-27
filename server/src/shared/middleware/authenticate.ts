import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../../modules/auth/auth.types.js';
import { AppError } from '../errors/AppError.js';
import { config } from '../../config/env.js';

// verifica que la request viene de un usuario logueado, sino devuelve un error 401

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies.token;
  if (!token) {
    return next(new AppError('No token provided', 401));
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    req.userId = decoded.sub;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    } else if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
  }
}
