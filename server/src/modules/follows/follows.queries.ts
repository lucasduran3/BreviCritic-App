import { PoolClient, QueryResult } from 'pg';

export async function followUserQuerie(
  client: PoolClient,
  followerId: string,
  followedId: string,
): Promise<void> {
  await client.query(
    'INSERT INTO app.follows (follower_id, followed_id) VALUES ($1, $2)',
    [followerId, followedId],
  );
}

export async function unfollowUserQuerie(
  client: PoolClient,
  followerId: string,
  followedId: string,
): Promise<QueryResult<any>> {
  return await client.query(
    'DELETE FROM app.follows WHERE follower_id = $1 AND followed_id = $2 RETURNING follower_id',
    [followerId, followedId],
  );
}
