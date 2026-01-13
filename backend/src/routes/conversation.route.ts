import { Router } from 'express';
import {
  createGroup,
  getConversationByUser,
  getConversations,
  getMessages,
} from '../controllers/conversation.controller';
const conversationRoutes = Router()
  .post('/add-group', createGroup)
  .get('/by-user', getConversationByUser)
  .get('/', getConversations)
  .get('/:conversationId/messages', getMessages);

export default conversationRoutes;
