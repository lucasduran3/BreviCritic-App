import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import {
  getMe,
  updateMe,
  getProfileByUsername,
  searchProfiles,
  deleteMe,
} from './profiles.controller.js';
import {
  followUserHandler,
  unfollowUserHandler,
} from '../follows/follows.controller.js';
import {
  updateProfileValidation,
  searchProfilesValidation,
  deleteOwnProfileValidation,
  handleValidationErrors,
} from './profiles.validator.js';
import { reviewFiltersValidation } from '../reviews/reviews.validator.js';
import { getReviewsByUsername } from '../reviews/reviews.controller.js';

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

router.post('/:username/follow', authenticate, followUserHandler);

router.delete(
  '/me',
  authenticate,
  deleteOwnProfileValidation,
  handleValidationErrors,
  deleteMe,
);

router.delete('/:username/follow', authenticate, unfollowUserHandler);

export default router;
