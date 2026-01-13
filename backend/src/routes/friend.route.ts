import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendRequests,
} from '../controllers/friend.controller';

const friendRoutes = Router()
  .post('/requests', sendFriendRequest)
  .post('/requests/:requestId/accept', acceptFriendRequest)
  .post('/requests/:requestId/decline', declineFriendRequest)
  .get('/', getAllFriends)
  .get('/requests', getFriendRequests);

export default friendRoutes;
