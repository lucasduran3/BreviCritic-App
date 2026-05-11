import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notifications.service.js';

export async function getNotificationsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filters = {
      limit: Number(req.query.limit ?? 20),
      offset: Number(req.query.offset ?? 0),
      isRead:
        req.query.isRead === 'true'
          ? true
          : req.query.isRead === 'false'
            ? false
            : undefined,
    };
    const notifications = await notificationService.getNotifications(
      req.userId!,
      filters,
    );
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsReadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await notificationService.markNotificationAsRead(
      req.userId!,
      req.params.notificationId as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsReadHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await notificationService.markAllNotificationsAsRead(req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function deleteNotificationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await notificationService.deleteNotification(
      req.userId!,
      req.params.notificationId as string,
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
