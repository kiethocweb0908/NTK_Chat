import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import { protect } from '../middlewares/auth.middleware';

const router = Router();
router.use('/auth', authRoutes);
router.use('/user', protect, userRoutes);

export default router;
