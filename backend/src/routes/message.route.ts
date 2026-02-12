import { Router } from 'express';
import {
  sendDirectMessage,
  sendGroupMessage,
  recallMessage,
} from '../controllers/message.controller';
import { uploadMessages } from '../middlewares/upload.middleware';

const messageRoutes = Router()
  .post('/direct', uploadMessages, sendDirectMessage)
  .post('/group', uploadMessages, sendGroupMessage)
  .patch('/recall/:messageId', recallMessage);

export default messageRoutes;
