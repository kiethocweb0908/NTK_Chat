import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import {
  requestIdSchema,
  sendRequestSchema,
} from '../validators/friend.validator';
import * as friendService from '../services/friend.service';
import { HTTPSTATUS } from '../config/http.config';
import Message from '../models/Message.model';

// gửi yêu cầu kết bạn
export const sendFriendRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { to, message } = sendRequestSchema.parse(req.body);
    const from = req.user?._id;

    const request = await friendService.sendRequestService({
      from,
      to,
      message,
    });

    res.status(HTTPSTATUS.CREATED).json({
      message: 'Đã gửi lời mời kết bạn!',
      request,
    });
  }
);

// chấp nhận
export const acceptFriendRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = requestIdSchema.parse(req.params);
    const userId = req.user?._id;
    console.log('userId: ', userId);

    const from = await friendService.acceptService(requestId, userId);

    res.status(HTTPSTATUS.CREATED).json({
      message: 'Chấp nhận lời mời kết bạn thành công!',
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  }
);

// từ chối
export const declineFriendRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = requestIdSchema.parse(req.params);
    const userId = req.user?._id;

    const displayName = await friendService.declineService(requestId, userId);

    res.status(HTTPSTATUS.OK).json({
      message: `Đã từ chối yêu cầu kết bạn của ${displayName}`,
    });
  }
);

// lấy danh sách bạn bè
export const getAllFriends = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const friends = await friendService.getAllFriendsService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: 'Lấy danh sách bạn bè thành công!',
      friends,
    });
  }
);

// lấy ds yêu cầu kp đã gửi/nhận
export const getFriendRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { sent, received } = await friendService.getFriendRequestsService(
      userId
    );

    res.status(HTTPSTATUS.OK).json({
      message: 'Lấy yêu cầu kết bạn thành công',
      sent,
      received,
    });
  }
);
