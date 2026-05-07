import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { getMovie, searchMovies } from './movies.controller.js';
import {
  getMovieValidation,
  searchMoviesValidation,
  handleValidationErrors,
} from './movies.validator.js';

const router = Router();

router.get(
  '/search',
  authenticate,
  searchMoviesValidation,
  handleValidationErrors,
  searchMovies,
);

router.get(
  '/:tmdbId',
  authenticate,
  getMovieValidation,
  handleValidationErrors,
  getMovie,
);

export default router;
