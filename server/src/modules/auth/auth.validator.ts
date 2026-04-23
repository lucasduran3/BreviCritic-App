import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const registerValidation = [
  body('username')
    .isString()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('name')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('lastname')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Lastname must be between 1 and 50 characters'),
  body('country')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country must be between 1 and 50 characters'),
  body('city')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be between 1 and 50 characters'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('profilePhotoUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for the profile photo'),
];

export const loginValidation = [
  body('identifier')
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('Identifier must be between 3 and 50 characters'),
  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
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
