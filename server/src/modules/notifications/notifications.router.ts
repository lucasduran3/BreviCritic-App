import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.js';
import {
  getNotificationsHandler,
  markNotificationAsReadHandler,
  markAllNotificationsAsReadHandler,
  deleteNotificationHandler,
} from './notifications.controller.js';
import {
  notificationValidation,
  handleValidationErrors,
} from './notifications.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  notificationValidation,
  handleValidationErrors,
  getNotificationsHandler,
);

router.patch('/read-all', authenticate, markAllNotificationsAsReadHandler);

router.patch(
  '/:notificationId/read',
  authenticate,
  markNotificationAsReadHandler,
);

router.delete('/:notificationId', authenticate, deleteNotificationHandler);

export default router;