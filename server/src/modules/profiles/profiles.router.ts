import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import {
  getMe,
  updateMe,
  getProfileByUsername,
  searchProfiles,
} from './profiles.controller.js';
import {
  updateProfileValidation,
  searchProfilesValidation,
  handleValidationErrors,
} from './profiles.validator.js';
import { reviewFiltersValidation } from '../reviews/reviews.validator.js';
import { getReviewsByUsername } from '../reviews/reviews.scontroller.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch(
  '/me',
  authenticate,
  updateProfileValidation,
  handleValidationErrors,
  updateMe,
);

router.get(
  '/',
  authenticate,
  searchProfilesValidation,
  handleValidationErrors,
  searchProfiles,
);

router.get('/:username', authenticate, getProfileByUsername);

router.get(
  '/:username/reviews',
  authenticate,
  reviewFiltersValidation,
  handleValidationErrors,
  getReviewsByUsername,
);

export default router;
