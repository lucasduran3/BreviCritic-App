import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import {
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from './reviews.controller.js';
import {
  upsertReactionHandler,
  removeReactionHandler,
} from '../reactions/reactions.controller.js';
import {
  createReviewValidation,
  updateReviewValidation,
  handleValidationErrors,
} from './reviews.validator.js';
import { upsertReactionValidation } from '../reactions/reactions.validator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  createReviewValidation,
  handleValidationErrors,
  createReview,
);

router.post(
  '/:reviewId/reactions',
  authenticate,
  upsertReactionValidation,
  handleValidationErrors,
  upsertReactionHandler,
);

router.delete('/:reviewId/reactions', authenticate, removeReactionHandler);

router.get('/:reviewId', authenticate, getReviewById);

router.patch(
  '/:reviewId',
  authenticate,
  updateReviewValidation,
  handleValidationErrors,
  updateReview,
);

router.delete('/:reviewId', authenticate, deleteReview);

export default router;
