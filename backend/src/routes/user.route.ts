import { Router } from 'express';
import { getMe, searchUsers } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const userRoutes = Router().get('/me', getMe).get('/search', searchUsers);

export default userRoutes;
