import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const registerValidation = [
  body('username').isString().isLength({ min: 3, max: 20 }),
  body('name').isString().isLength({ min: 1, max: 50 }),
  body('lastname').isString().isLength({ min: 1, max: 50 }),
  body('country').isString().isLength({ min: 1, max: 50 }),
  body('city').isString().isLength({ min: 1, max: 50 }),
  body('isPublic').isBoolean(),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  body('profilePhotoUrl').optional().isURL(),
];

export const loginValidation = [
  body('identifier').isString().isLength({ min: 3, max: 50 }),
  body('password').isString().isLength({ min: 6 }),
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
