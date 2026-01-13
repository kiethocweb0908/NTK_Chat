import User from '../models/User.model';
import Friend from '../models/Friend.model';
import FriendRequest from '../models/FriendRequest.model';
import { BadRequestException, NotFoundException } from '../utils/app-error';
import { SendRequestType } from '../validators/friend.validator';
import mongoose from 'mongoose';
import { IPopulatedFriendship } from '../types/populated.type';

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

  return request;
};

// chấp nhận
export const acceptService = async (requestId: string, userId: string) => {
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new BadRequestException('Không tìm thấy lời mời kết bạn');

  if (request.to.toString() !== userId.toString())
    throw new BadRequestException('Bạn không có quyền chấp nhận lời mời này!');

  const friend = await Friend.create({
    userA: request.from,
    userB: userId,
  });

  await FriendRequest.findByIdAndDelete(request);

  const from = await User.findById(request.from)
    .select('_id displayName avatarUrl')
    .lean();

  return from;
};

// từ chối
export const declineService = async (requestId: string, userId: string) => {
  const request = await FriendRequest.findById(requestId);
  if (!request) throw new BadRequestException('Không tìm thấy lời mời kết bạn');

  if (request.to.toString() !== userId)
    throw new BadRequestException('Bạn không có quyền từ chối lời mời này!');

  await FriendRequest.findByIdAndDelete(request);

  const from = await User.findById(request.from).select('displayName').lean();
  return from?.displayName;
};

// lấy ds bạn
export const getAllFriendsService = async (userId: string) => {
  const friendships = (await Friend.find({
    $or: [{ userA: userId }, { userB: userId }],
  })
    .populate([
      { path: 'userA', select: '_id displayName avatarUrl' },
      { path: 'userB', select: '_id displayName avatarUrl' },
    ])
    .lean()) as unknown as IPopulatedFriendship[];

  if (!friendships) return [];

  return friendships
    .filter((f) => f.userA && f.userB)
    .map((f) => {
      const isUserA = f.userA._id.toString() === userId.toString();
      return isUserA ? f.userB : f.userA;
    });
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
