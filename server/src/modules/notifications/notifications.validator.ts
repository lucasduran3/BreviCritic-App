import { query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const notificationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .toInt()
    .default(20)
    .withMessage('Limit must be an integer between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .default(0)
    .withMessage('Offset must be a non-negative integer'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
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
