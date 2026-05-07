import { withUser } from '../../db/withUser.js';
import { AppError } from '../../shared/errors/AppError.js';
import { followUserQuerie, unfollowUserQuerie } from './follows.queries.js';

export async function followUser(
  requesterId: string,
  followedUsername: string,
): Promise<void> {
  return withUser(requesterId, async (client) => {
    const followedId = await client.query(
      'SELECT id FROM app.profiles WHERE username = $1',
      [followedUsername],
    );

    if (followedId.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    if (followedId.rows[0].id === requesterId) {
      throw new AppError('Cannot follow yourself', 400);
    }

    try {
      await followUserQuerie(client, requesterId, followedId.rows[0].id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError('Already following this user', 409);
      }
      throw error;
    }
  });
}

export async function unfollowUser(
  requesterId: string,
  followedUsername: string,
): Promise<void> {
  return withUser(requesterId, async (client) => {
    const followedId = await client.query(
      'SELECT id FROM app.profiles WHERE username = $1',
      [followedUsername],
    );

    if (followedId.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    const result = await unfollowUserQuerie(
      client,
      requesterId,
      followedId.rows[0].id,
    );
    if (result.rows.length === 0) throw new AppError('Follow not found', 404);
  });
}
