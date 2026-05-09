import { PoolClient, QueryResult } from 'pg';
import {
  NotificationFilters,
  NotificationItem,
} from './notifications.types.js';

export async function findNotifications(
  client: PoolClient,
  userId: string,
  filters: NotificationFilters,
): Promise<NotificationItem[]> {
  const result = await client.query(
    `SELECT
          n.id,
          n.type,
          n.is_read,
          n.created_at,
          p.username AS actor_username,
          p.profile_photo AS actor_photo,
          r.id AS review_id,
          m.title AS movie_title
        FROM app.notifications n
        JOIN app.profiles p ON p.id = n.actor_id
        LEFT JOIN app.reviews r ON r.id = n.target_review_id
        LEFT JOIN app.movies m ON m.id = r.movie_id
        WHERE (n.target_profile_id = $1
            OR app.is_review_owner(n.target_review_id))
            AND ($4:: boolean IS NULL OR n.is_read = $4)
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3`,
    [userId, filters.limit, filters.offset, filters.isRead],
  );

  return result.rows.map((row) => mapToNotificationItem(row));
}

export async function markAsRead(
  client: PoolClient,
  notificationId: string,
): Promise<QueryResult<any>> {
  return await client.query(
    'UPDATE app.notifications SET is_read = true WHERE id = $1 RETURNING id',
    [notificationId],
  );
}

export async function markAllAsRead(
  client: PoolClient,
  userId: string,
): Promise<void> {
  await client.query(
    'UPDATE app.notifications SET is_read = true WHERE target_profile_id = $1 OR app.is_review_owner(target_review_id)',
    [userId],
  );
}

export async function deleteNotification(
  client: PoolClient,
  notificationId: string,
): Promise<QueryResult<any>> {
  return await client.query(
    'DELETE FROM app.notifications WHERE id = $1 RETURNING id',
    [notificationId],
  );
}

function mapToNotificationItem(row: Record<string, unknown>): NotificationItem {
  return {
    id: row.id as string,
    type: row.type as 'follow' | 'like',
    isRead: row.is_read as boolean,
    createdAt: row.created_at as Date,
    actor: {
      username: row.actor_username as string,
      profilePhotoUrl: row.actor_photo as string | null,
    },
    review: row.review_id
      ? {
          id: row.review_id as string,
          movieTitle: row.movie_title as string,
        }
      : undefined,
  };
}
