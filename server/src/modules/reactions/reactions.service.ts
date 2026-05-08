import { withUser } from '../../db/withUser.js';
import { AppError } from '../../shared/errors/AppError.js';
import { findReviewById } from '../reviews/reviews.queries.js';
import { ReactionResult, UpsertReactionDTO } from './reactions.types.js';
import * as reactionsQueries from './reactions.queries.js';

export async function upsertReaction(
  userId: string,
  reviewId: string,
  dto: UpsertReactionDTO,
): Promise<ReactionResult> {
  return withUser(userId, async (client) => {
    const result = await findReviewById(client, reviewId);
    if (!result) throw new AppError('Review not found', 404);

    return await reactionsQueries.upsertReaction(client, userId, reviewId, dto);
  });
}

export async function removeReaction(
  userId: string,
  reviewId: string,
): Promise<void> {
  return withUser(userId, async (client) => {
    const result = await reactionsQueries.removeReaction(
      client,
      userId,
      reviewId,
    );
    if (result.rows.length === 0) {
      throw new AppError('Reaction not found', 404);
    }
  });
}
