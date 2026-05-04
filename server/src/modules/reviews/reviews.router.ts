import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import {
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from './reviews.scontroller.js';
import {
  createReviewValidation,
  updateReviewValidation,
  handleValidationErrors,
} from './reviews.validator.js';

const router = Router();

router.post(
  '/',
  authenticate,
  createReviewValidation,
  handleValidationErrors,
  createReview,
);

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
