import {
  CreateReviewDTO,
  Review,
  ReviewFilters,
  UpdateReviewDTO,
} from './reviews.types.js';
import {
  insertReview,
  updateReviewQuerie,
  findReviewById,
  findReviewsByUserId,
  removeReview,
} from './reviews.queries.js';
import { withUser } from '../../db/withUser.js';
import { AppError } from '../../shared/errors/AppError.js';
import { getOrFetchMovie } from '../movies/movies.service.js';

export async function createReview(
  userId: string,
  dto: CreateReviewDTO,
): Promise<Review> {
  await getOrFetchMovie(dto.movieId); // comprobar que la pelicula existe en la DB
  return withUser(userId, async (client) => {
    return await insertReview(client, userId, dto);
  });
}

export async function getReviewById(
  userId: string,
  reviewId: string,
): Promise<Review> {
  return withUser(userId, async (client) => {
    const review = await findReviewById(client, reviewId);
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    return review;
  });
}

export async function getReviewsByUsername(
  requesterId: string,
  username: string,
  filters: ReviewFilters,
): Promise<Review[]> {
  return withUser(requesterId, async (client) => {
    const profile = await client.query(
      'SELECT id FROM app.profiles WHERE username = $1',
      [username],
    );

    if (profile.rows.length === 0) {
      const exists = await client.query(
        'SELECT id FROM app.profile_search WHERE username = $1',
        [username],
      );
      if (exists.rows.length === 0) {
        throw new AppError('Profile not found', 404);
      }
      throw new AppError('This profile is private', 403);
    }

    const targetUserId = profile.rows[0].id;

    return findReviewsByUserId(client, targetUserId, filters);
  });
}

export async function updateReview(
  userId: string,
  reviewId: string,
  dto: UpdateReviewDTO,
): Promise<Review> {
  return withUser(userId, async (client) => {
    const updatedReview = await updateReviewQuerie(client, reviewId, dto);
    if (!updatedReview) {
      throw new AppError('Review not found', 404);
    }
    return updatedReview;
  });
}

export async function deleteReview(
  userId: string,
  reviewId: string,
): Promise<void> {
  return withUser(userId, async (client) => {
    const result = await removeReview(client, reviewId);

    if (result.rows.length === 0) throw new AppError('Review not found', 404);
  });
}
