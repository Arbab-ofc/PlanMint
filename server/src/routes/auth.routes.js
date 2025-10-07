import express from 'express';
import { 
  signup, 
  verifySignupOTP, 
  resendVerificationOTP,
  login,
  logout, 
  forgotPassword,
  resetPassword,
  checkAvailability,
  getCurrentUser
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/check-availability', checkAvailability);


router.post('/signup', signup);


router.post('/verify-otp', verifySignupOTP);


router.post('/resend-otp', resendVerificationOTP);


router.post('/login', login);


router.get('/me', authenticate, getCurrentUser);


router.post('/logout', logout);


router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

export default router;
