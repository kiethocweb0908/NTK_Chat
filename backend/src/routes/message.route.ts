import { Router } from 'express';
import {
  sendDirectMessage,
  sendGroupMessage,
} from '../controllers/message.controller';

const messageRoutes = Router()
  .post('/direct', sendDirectMessage)
  .post('/group', sendGroupMessage);

export default messageRoutes;
