import { Router } from 'express';
import {
  sendDirectMessage,
  sendGroupMessage,
  recallMessage,
} from '../controllers/message.controller';

const messageRoutes = Router()
  .post('/direct', sendDirectMessage)
  .post('/group', sendGroupMessage)
  .patch('/recall/:messageId', recallMessage);

export default messageRoutes;
