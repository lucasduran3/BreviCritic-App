import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const createReviewValidation = [
  body('movieId')
    .isInt({ min: 1 })
    .withMessage('Movie ID must be a positive integer')
    .toInt(),
  body('content')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('Content must be between 3 and 50 characters'),
  body('score')
    .isInt({ min: 0, max: 5 })
    .withMessage('Score must be an integer between 0 and 5')
    .toInt(),
];

export const updateReviewValidation = [
  body('content')
    .optional()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('Content must be between 3 and 50 characters'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Score must be and Integer between 0 and 5')
    .toInt(),
  body().custom((value) => {
    const allowedFields = ['content', 'score'];
    const hasAtLeastOnField = Object.keys(value).some((key) =>
      allowedFields.includes(key),
    );
    if (!hasAtLeastOnField) {
      throw new Error('At least one valid field must be provided');
    }
    return true;
  }),
];

export const reviewFiltersValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .toInt()
    .default(20)
    .withMessage('Limit must be an integer'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .default(0)
    .withMessage('Offset must be an integer'),
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
