import { Router } from 'express';
import {
  editInformation,
  getAIUsers,
  getMe,
  searchUsers,
} from '../controllers/user.controller';
import { uploadAvatar } from '../middlewares/upload.middleware';

const userRoutes = Router()
  .get('/me', getMe)
  .get('/search', searchUsers)
  .patch(`/edit-info`, uploadAvatar, editInformation)
  .get(`/ai-bots`, getAIUsers);

export default userRoutes;
