import { withUser } from '../../db/withUser.js';
import { AppError } from '../../shared/errors/AppError.js';
import * as notificationQueries from './notifications.queries.js';
import {
  NotificationFilters,
  NotificationItem,
} from './notifications.types.js';

export async function getNotifications(
  userId: string,
  filters: NotificationFilters,
): Promise<NotificationItem[]> {
  return withUser(userId, async (client) => {
    return await notificationQueries.findNotifications(client, userId, filters);
  });
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  return withUser(userId, async (client) => {
    const result = await notificationQueries.markAsRead(client, notificationId);

    if (result.rows.length === 0) {
      throw new AppError('Notification not found', 404);
    }
  });
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<void> {
  return withUser(userId, async (client) => {
    await notificationQueries.markAllAsRead(client, userId);
  });
}

export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<void> {
  return withUser(userId, async (client) => {
    const result = await notificationQueries.deleteNotification(
      client,
      notificationId,
    );
    if (result.rows.length === 0) {
      throw new AppError('Notification not found', 404);
    }
  });
}
