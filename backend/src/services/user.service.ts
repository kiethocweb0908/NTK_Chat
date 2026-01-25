import Friend from '../models/Friend.model';
import FriendRequest from '../models/FriendRequest.model';
import User from '../models/User.model';
import { BadRequestException } from '../utils/app-error';

export const searchUsersService = async (keyword: string, meId: string) => {
  if (!keyword?.trim())
    throw new BadRequestException('Không có từ khóa tìm kiếm');

  const search = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1. Tìm users, loại trừ chính mình ngay từ đầu
  const users = await User.find({
    $or: [
      { userName: search },
      { displayName: { $regex: search, $options: 'i' } },
    ],
    _id: { $ne: meId },
  })
    .select('_id displayName userName avatarUrl')
    .limit(10)
    .lean();

  if (!users.length) return [];

  const userIds = users.map((u) => u._id);

  // 2. Lấy đồng thời Friend và FriendRequest
  const [friends, requests] = await Promise.all([
    Friend.find({
      $or: [
        { userA: meId, userB: { $in: userIds } },
        { userB: meId, userA: { $in: userIds } },
      ],
    }).lean(),
    FriendRequest.find({
      $or: [
        { from: meId, to: { $in: userIds } },
        { to: meId, from: { $in: userIds } },
      ],
    }).lean(),
  ]);

  // 3. Map hóa dữ liệu để truy xuất O(1)
  // Lưu ý: Với Friend, ta chỉ cần biết ID của người kia là bạn
  const friendIds = new Set(
    friends.map((f) =>
      f.userA.toString() === meId ? f.userB.toString() : f.userA.toString()
    )
  );

  const requestMap = new Map(
    requests.map((r) => [
      r.from.toString() === meId ? r.to.toString() : r.from.toString(),
      {
        type: r.from.toString() === meId ? 'sent' : 'received',
        requestId: r._id,
      },
    ])
  );

  // 4. Trả về kết quả
  return users.map((u) => {
    const uid = u._id.toString();
    const request = requestMap.get(uid);

    return {
      ...u,
      relationship: friendIds.has(uid)
        ? 'friend'
        : request
          ? request.type
          : 'none',
      requestId: request?.requestId,
    };
  });
};
