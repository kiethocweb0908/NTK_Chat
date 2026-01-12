import { Router } from 'express';
import { getMe } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const userRoutes = Router().get('/me', protect, getMe);

export default userRoutes;
