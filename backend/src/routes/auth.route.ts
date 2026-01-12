import { Router } from 'express';
import {
  login,
  logout,
  register,
  refreshToken,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const authRoutes = Router()
  .post('/register', register)
  .post('/login', login)
  .post('/logout', protect, logout)
  .post('/refresh', refreshToken);

export default authRoutes;
