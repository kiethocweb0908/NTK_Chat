import { Router } from 'express';
import {
  login,
  logout,
  register,
  refreshToken,
  verifyOTPRegister,
  resendOTP,
  forgotPassword,
  verifyOTPforgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const authRoutes = Router()
  .post('/register', register)
  .post('/verify-otp-register', verifyOTPRegister)

  .post('/forgot-password', forgotPassword)
  .post('/verify-otp-forgot', verifyOTPforgotPassword)
  .post('/reset-password', resetPassword)

  .post('/resend-otp', resendOTP)

  .post('/login', login)
  .post('/logout', protect, logout)
  .post('/refresh', refreshToken);

export default authRoutes;
