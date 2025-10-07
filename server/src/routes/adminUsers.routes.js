import express from 'express';
import { listUsers, getUser, updateUser, changeUserRole, verifyEmailManual } from '../controllers/adminUsers.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.use(authenticate);
router.use(requireAdmin);


router.get('/users', listUsers);


router.get('/users/:userId', getUser);


router.put('/users/:userId', updateUser);


router.patch('/users/:userId/role', changeUserRole);


router.patch('/users/:userId/verify-email', verifyEmailManual);

export default router;
