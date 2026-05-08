import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const upsertReactionValidation = [
  body('type')
    .isIn(['like', 'dislike'])
    .withMessage('Type must be either "like" or "dislike"'),
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
