import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const updateProfileValidator = [
  body('username')
    .optional()
    .isString()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('lastname')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Lastname must be between 1 and 50 characters'),
  body('country')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country must be between 1 and 50 characters'),
  body('city')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be between 1 and 50 characters'),
  body('profilePhotoUrl')
    .optional()
    .isURL()
    .withMessage('Profile photo must be a valid URL'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  // Rechazar si el body esta completamente vacio y no tiene los campos permitidos
  body().custom((value) => {
    const allowedFields = [
      'username',
      'name',
      'lastname',
      'country',
      'city',
      'profilePhotoUrl',
      'isPublic',
    ];
    const hasAtLeastOneField = Object.keys(value).some((key) =>
      allowedFields.includes(key),
    );
    if (!hasAtLeastOneField) {
      throw new Error('At least one valid field must be provided');
    }
    return true;
  }),
];

export const searchProfilesValidator = [
  query('search')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Search must be a string'),
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
