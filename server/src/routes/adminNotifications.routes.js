import express from 'express';
import {
  listUserNotifications,
  deleteNotification,
  broadcast,
  deleteUserNotifications,
  getNotificationStats
} from '../controllers/adminNotifications.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);
router.use(requireAdmin);


router.get('/stats', getNotificationStats);


router.post('/broadcast', broadcast);

router.get('/users/:userId', listUserNotifications);


router.delete('/users/:userId', deleteUserNotifications);


router.delete('/:notificationId', deleteNotification);

export default router;
