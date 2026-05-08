import { PoolClient } from 'pg';
import { ReactionResult, UpsertReactionDTO } from './reactions.types.js';
import { QueryResult } from 'pg';

export async function upsertReaction(
  client: PoolClient,
  userId: string,
  reviewId: string,
  dto: UpsertReactionDTO,
): Promise<ReactionResult> {
  const result = await client.query(
    `WITH upsert AS (
        INSERT INTO app.reviews_reaction (user_id, review_id, type)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, review_id) DO UPDATE
        SET type = EXCLUDED.type
        RETURNING type, review_id
    )
    SELECT upsert.type, upsert.review_id, r.likes, r.dislikes
    FROM upsert
    JOIN app.reviews r ON r.id = upsert.review_id`,
    [userId, reviewId, dto.type],
  );

  return mapToReactionResult(result.rows[0]);
}

export async function removeReaction(
  client: PoolClient,
  userId: string,
  reviewId: string,
): Promise<QueryResult<any>> {
  return await client.query(
    'DELETE FROM app.reviews_reaction WHERE user_id = $1 AND review_id = $2 RETURNING review_id',
    [userId, reviewId],
  );
}

function mapToReactionResult(row: Record<string, unknown>): ReactionResult {
  return {
    reviewId: row.review_id as string,
    type: row.type as 'like' | 'dislike',
    likes: row.likes as number,
    dislikes: row.dislikes as number,
  };
}
