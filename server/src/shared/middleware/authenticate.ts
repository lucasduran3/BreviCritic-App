import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../../modules/auth/auth.types.js';
import { AppError } from '../errors/AppError.js';
import { config } from '../../config/env.js';
import pool from '../../db/pool.js';

// verifica que la request viene de un usuario logueado, sino devuelve un error 401

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies.token;
  if (!token) {
    return next(new AppError('No token provided', 401));
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    const result = await pool.query(
      'SELECT auth.is_user_active($1) AS is_active',
      [decoded.sub],
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }
    if (!result.rows[0]?.is_active) {
      return next(new AppError('Account is disabled', 401));
    }

    req.userId = decoded.sub;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    } else if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    next(err);
  }
}
