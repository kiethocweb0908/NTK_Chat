import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  deleteFriend,
  getFriends,
  searchFriends,
} from '../controllers/friend.controller';

const friendRoutes = Router()
  .post('/requests', sendFriendRequest)
  .post('/requests/:requestId/accept', acceptFriendRequest)
  .post('/requests/:requestId/decline', declineFriendRequest)
  .delete('/:targetUserId/delete', deleteFriend)
  .get('/requests', getFriendRequests)
  .get('/', getFriends)
  .get(`/search`, searchFriends);

export default friendRoutes;
