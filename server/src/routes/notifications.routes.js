import express from 'express';
import {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllRead
} from '../controllers/notifications.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);


router.get('/unread-count', unreadCount);


router.get('/', listNotifications);


router.patch('/mark-all-read', markAllRead);


router.delete('/delete-all-read', deleteAllRead);


router.patch('/:notificationId/read', markRead);


router.delete('/:notificationId', deleteNotification);

export default router;
