import { param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const getMovieValidation = [
  param('tmdbId')
    .isInt({ min: 1 })
    .withMessage('TmdbId must be a positive integer')
    .toInt(),
];

export const searchMoviesValidation = [
  query('query')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 500 })
    .toInt()
    .withMessage('page must be a positive integer'),
];

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}
