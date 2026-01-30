import { Router } from 'express';
import {
  editInformation,
  getMe,
  searchUsers,
} from '../controllers/user.controller';
import { uploadAvatar } from '../middlewares/upload.middleware';

const userRoutes = Router()
  .get('/me', getMe)
  .get('/search', searchUsers)
  .patch(`/edit-info`, uploadAvatar, editInformation);

export default userRoutes;
