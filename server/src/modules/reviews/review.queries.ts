import { PoolClient } from 'pg';
import {
  Review,
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewFilters,
} from './reviews.types.js';

export async function createReview(
  client: PoolClient,
  userId: string,
  dto: CreateReviewDTO,
): Promise<Review> {
  const result = await client.query(
    'INSERT INTO app.reviews (user_id, movie_id, content, score) VALUES ($1, $2, $3) RETURNING *',
    [userId, dto.movieId, dto.content, dto.score],
  );

  return mapToReview(result.rows[0]);
}

export async function findReviewById(
  client: PoolClient,
  reviewId: string,
): Promise<Review | null> {
  const result = await client.query('SELECT * FROM app.reviews WHERE id = $1', [
    reviewId,
  ]);

  if (result.rows.length === 0) return null;

  return mapToReview(result.rows[0]);
}

export async function findReviewsByUserId(
  client: PoolClient,
  userId: string,
  filters: ReviewFilters,
): Promise<Review[] | null> {
  const { limit, offset } = filters;
  const result = await client.query(
    'SELECT * FROM app.reviews WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset],
  );

  if (result.rows.length === 0) return null;

  return result.rows.map((v) => mapToReview(v));
}

export async function updateReview(
  client: PoolClient,
  reviewId: string,
  dto: UpdateReviewDTO,
): Promise<Review | null> {
  const fieldMap: Record<keyof UpdateReviewDTO, string> = {
    content: 'content',
    score: 'score',
  };

  const entries = Object.entries(dto) as [keyof UpdateReviewDTO, unknown][];
  const setClauses = entries.map(
    ([key], index) => `${fieldMap[key]} =  $${index + 1}`,
  );

  const values = entries.map(([, value]) => value);

  if (setClauses.length === 0) return findReviewById(client, reviewId);

  const result = await client.query(
    `UPDATE app.reviews SET ${setClauses.join(', ')} WHERE id =$${values.length + 1} RETURNING *`,
    [...values, reviewId],
  );

  if (result.rows.length === 0) return null;

  return mapToReview(result.rows[0]);
}

export async function deleteReview(
  client: PoolClient,
  reviewId: string,
): Promise<void> {
  await client.query('DELETE FROM app.reviews WHERE id = $1', [reviewId]);
}

function mapToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    movieId: row.movie_id as number,
    content: row.content as string,
    score: row.score as number,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}
