import User from '../models/User.model';
import Friend from '../models/Friend.model';
import FriendRequest from '../models/FriendRequest.model';
import { BadRequestException, NotFoundException } from '../utils/app-error';
import { SendRequestType } from '../validators/friend.validator';

import { IPopulatedFriendship } from '../types/populated.type';
import { getSocketIdByUserId, io } from '../socket/index.socket';
import mongoose from 'mongoose';

// gửi lời mời kp
export const sendRequestService = async (
  data: SendRequestType & { from: string }
) => {
  const { from, to, message } = data;

  if (from.toString() === to.toString())
    throw new BadRequestException(
      'Không thể gửi yêu cầu kết bạn cho chính mình'
    );

  const recevier = await User.findById(to);
  if (!recevier) throw new NotFoundException('Người nhận không tồn tại');

  let userA = from.toString();
  let userB = to.toString();

  if (userA > userB) [userA, userB] = [userB, userA];

  const [alreadyFriends, exstingRequest] = await Promise.all([
    Friend.findOne({ userA, userB }),
    FriendRequest.findOne({
      $or: [
        { from, to },
        { to, from },
      ],
    }),
  ]);

  if (alreadyFriends) throw new BadRequestException('Hai người đã là bạn bè');
  if (exstingRequest)
    throw new BadRequestException('Đã có yêu cầu kết bạn đang chờ trước đó');

  const request = await FriendRequest.create({
    from,
    to,
    message,
  });

  const populatedRequest = (await request.populate([
    {
      path: 'to',
      select: '_id displayName userName avatarUrl',
    },
    {
      path: 'from',
      select: '_id displayName userName avatarUrl',
    },
  ])) as any;

  const receiverSocketId = getSocketIdByUserId(to.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('friend-request-received', {
      request: populatedRequest,
    });
  }

  return {
    message: `Đã gửi lời mời kết bạn đến ${populatedRequest.to.displayName}`,
    request: populatedRequest,
  };
};

// chấp nhận
export const acceptService = async (requestId: string, userId: string) => {
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new BadRequestException('Không tìm thấy lời mời kết bạn');

  if (request.to.toString() !== userId.toString())
    throw new BadRequestException('Bạn không có quyền chấp nhận lời mời này!');

  const existed = await Friend.findOne({
    $or: [
      { userA: request.from, userB: userId },
      { userA: userId, userB: request.from },
    ],
  });

  if (!existed) {
    await Friend.create({
      userA: request.from,
      userB: userId,
    });
  }

  await FriendRequest.findByIdAndDelete(requestId);

  const from = await User.findById(request.from)
    .select('_id displayName userName avatarUrl')
    .lean();

  const to = await User.findById(userId)
    .select('_id displayName userName avatarUrl')
    .lean();

  const senderSocketId = getSocketIdByUserId(request.from.toString());
  if (senderSocketId) {
    io.to(senderSocketId).emit('friend-request-accepted', {
      requestId,
      newFriend: to,
      message: `${to?.displayName} đã chấp nhận lời mời kết bạn!`,
    });
  }

  return {
    message: 'Chấp nhận lời mời kết bạn thành công!',
    newFriend: from,
  };
};

// từ chối
export const declineService = async (requestId: string, userId: string) => {
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new BadRequestException('Không tìm thấy lời mời kết bạn');

  const isFromMe = request.from.toString() === userId;
  const isToMe = request.to.toString() === userId;

  if (!isFromMe && !isToMe)
    throw new BadRequestException('Bạn không có quyền hành động!');

  await FriendRequest.findByIdAndDelete(requestId);

  const actorId = isFromMe ? request.from : request.to;
  const targetUserId = isFromMe ? request.to : request.from;

  const actor = await User.findById(actorId).select('displayName').lean();
  const target = await User.findById(targetUserId).select('displayName').lean();

  const actionText = isFromMe
    ? 'đã huỷ lời mời kết bạn'
    : 'đã từ chối lời mời kết bạn';

  const receiverSocketId = getSocketIdByUserId(targetUserId.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('friend-request-decline', {
      requestId,
      actorId,
      message: `${actor?.displayName} ${actionText}`,
    });
  }

  return {
    message: `${actionText} với ${target?.displayName}`,
    targetUserId: targetUserId.toString(),
  };
};

export const deleteFriendSerivce = async (
  targetUserId: string,
  userId: string
) => {
  const existed = await Friend.findOne({
    $or: [
      { userA: targetUserId, userB: userId },
      { userA: userId, userB: targetUserId },
    ],
  });

  if (!existed) throw new BadRequestException('Hai người chưa phải là bạn bè');

  await Friend.findByIdAndDelete(existed._id);

  const [me, friend] = await Promise.all([
    User.findById(userId).select('_id userName displayName avatarUrl').lean(),
    User.findById(targetUserId)
      .select('_id userName displayName avatarUrl')
      .lean(),
  ]);

  const SocketId = getSocketIdByUserId(targetUserId.toString());
  if (SocketId) {
    io.to(SocketId).emit('friend-delete', {
      oldFriend: me,
      message: `${me?.displayName} đã xoá bạn bè với bạn 😭`,
    });
  }

  return {
    message: `Đã xoá ${friend?.displayName} khỏi danh sách bạn bè!`,
    oldFriend: friend,
  };
};

// lấy ds bạn
export const getFriendListService = async (
  userId: string,
  limit = 20,
  cursor?: string
) => {
  const query: any = { $or: [{ userA: userId }, { userB: userId }] };
  if (cursor) query._id = { $lt: cursor };

  const friendships = await Friend.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate([
      { path: 'userA', select: '_id userName displayName avatarUrl' },
      { path: 'userB', select: '_id userName displayName avatarUrl' },
    ])
    .lean<IPopulatedFriendship[]>();

  const friends = friendships.map((f) => {
    const friendInfo =
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA;
    return { ...friendInfo, friendshipId: f._id };
  });

  const hasNextPage = friends.length > limit;
  if (hasNextPage) friends.pop();

  return {
    friends,
    nextCursor: hasNextPage ? friends[friends.length - 1].friendshipId : null,
    hasNextPage,
  };
};

// tìm kiếm bạn bè
export const searchFriendsService = async (userId: string, keyword: string) => {
  if (!keyword?.trim()) {
    throw new BadRequestException('Thiếu từ khóa tìm kiếm');
  }

  const s = keyword.trim().toLowerCase();
  const safe = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return await Friend.aggregate([
    {
      $match: {
        $or: [
          { userA: new mongoose.Types.ObjectId(userId) },
          { userB: new mongoose.Types.ObjectId(userId) },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { userA: '$userA', userB: '$userB' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ['$_id', new mongoose.Types.ObjectId(userId)] },
                  {
                    $or: [
                      { $eq: ['$_id', '$$userA'] },
                      { $eq: ['$_id', '$$userB'] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $match: {
              $or: [
                { userName: { $regex: `^${safe}$`, $options: 'i' } },
                { displayName: { $regex: safe, $options: 'i' } },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              displayName: 1,
              avatarUrl: 1,
            },
          },
        ],
        as: 'friend',
      },
    },
    { $unwind: '$friend' },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ['$friend', { friendshipId: '$_id' }] },
      },
    },
    { $limit: 10 },
  ]);
};

// lấy danh sách yêu cầu
export const getFriendRequestsService = async (userId: string) => {
  const populateFields = `_id userName displayName avatarUrl`;
  const [sent, received] = await Promise.all([
    FriendRequest.find({ from: userId }).populate('to', populateFields).lean(),
    FriendRequest.find({ to: userId }).populate('from', populateFields).lean(),
  ]);

  return { sent, received };
};
