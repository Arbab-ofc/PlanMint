import express from 'express';
import {
  uploadAvatar,
  deleteAvatar,
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = express.Router();


router.use(authenticate);


router.get('/profile', getProfile);


router.put('/profile', updateProfile);


router.post('/avatar', uploadSingle('avatar'), uploadAvatar);


router.delete('/avatar', deleteAvatar);

router.patch('/password', changePassword);

export default router;
