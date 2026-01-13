import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import { protect } from '../middlewares/auth.middleware';
import friendRoutes from './friend.route';
import messageRoutes from './message.route';
import conversationRoutes from './conversation.route';

const router = Router();
router.use('/auth', authRoutes);
router.use('/user', protect, userRoutes);
router.use('/friend', protect, friendRoutes);
router.use('/message', protect, messageRoutes);
router.use('/conversation', protect, conversationRoutes);
export default router;
