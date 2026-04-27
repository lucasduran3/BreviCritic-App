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

export default router;