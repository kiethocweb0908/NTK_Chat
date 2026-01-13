import mongoose, { HydratedDocument } from 'mongoose';
import { IConversation } from '../models/Conversation.model';
import Message, { IMessage } from '../models/Message.model';
import Friend from '../models/Friend.model';

// cập nhật hội thoại khi có tin mới
export const updateConversationAfterCreateMessage = (
  conversation: HydratedDocument<IConversation>,
  message: HydratedDocument<IMessage>,
  senderId: string | mongoose.Types.ObjectId
) => {
  const lastContent = message.content
    ? message.content
    : message.images && message.images.length > 0
    ? '[Hình ảnh]'
    : '';

  conversation.set({
    seenBy: [senderId],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: lastContent,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((p) => {
    const memberId = p.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};

// kiểm tra mối quan hệ
export const checkMessageSpamLimit = async (
  senderId: string,
  recipientId: string,
  conversationId: string
) => {
  // kiểm tra bạn bè
  const isFriend = await Friend.findOne({
    $or: [
      { userA: senderId, userB: recipientId },
      { userA: recipientId, userB: senderId },
    ],
  });
  if (isFriend) return { allowed: true };

  // lấy 2 tin nhắn cuối và kiểm tra có phản hồi
  const lastMessages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(2)
    .lean();
  if (lastMessages.length > 0) {
    let consecutiveCount = 0;
    for (const msg of lastMessages) {
      if (msg.senderId.toString() === senderId.toString()) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    // nếu gửi 2 tin không cho gửi tiếp
    if (consecutiveCount >= 2)
      return {
        allowed: false,
        message:
          'Bạn chỉ được gửi tối đa 2 tin nhắn liên tiếp khi chưa là bạn bè. Vui lòng đợi phản hồi.',
      };
  }

  return { allowed: true };
};
