import path from 'path';
import Conversation from '../models/Conversation.model';
import { BadRequestException, NotFoundException } from '../utils/app-error';
import {
  getMessagesQueryType,
  groupSchemaType,
} from '../validators/conversation.validator';
import { IPopulatedParticipant } from '../types/populated.type';
import Message from '../models/Message.model';
import { io } from '../socket/index.socket';

// tạo group
export const createGroupService = async (
  data: groupSchemaType,
  userId: string
) => {
  const { name, memberIds } = data;

  const conversation = new Conversation({
    type: 'group',
    participants: [
      { userId, joijoinedAtnAt: new Date() },
      ...memberIds.map((id) => ({ userId: id, joinedAt: new Date() })),
    ],
    group: {
      name,
      createdBy: userId,
    },
    lastMessageAt: new Date(),
  });
  await conversation.save();

  if (!conversation)
    throw new BadRequestException('Có lỗi xảy ra, hộp thoại chưa được tạo');

  await conversation.populate([
    { path: 'participants.userId', select: 'displayName avatarUrl' },
    { path: 'seenBy', select: 'displayName avatarUrl' },
    { path: 'lastMessage.senderId', select: 'displayName avatarUrl' },
  ]);

  return conversation;
};

// lấy cuộc trò chuyện với 1 người
export const getConversationByUserService = async (
  userA: string,
  userB: string
) => {
  const isSelf = userA === userB;

  const conversation = await Conversation.findOne({
    type: isSelf ? 'self' : 'direct',
    participants: { $size: isSelf ? 1 : 2 },
    'participants.userId': isSelf ? userA : { $all: [userA, userB] },
  });

  if (!conversation) return null;

  return conversation;
};

// lấy danh sách cuộc trò chuyện
export const getConversationsService = async (userId: string) => {
  const conversations = await Conversation.find({
    'participants.userId': userId,
  })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .populate([
      { path: 'participants.userId', select: 'displayName avatarUrl' },
      { path: 'lastMessage.senderId', select: 'displayName avatarUrl' },
      { path: 'seenBy', select: 'displayName avatarUrl' },
    ]);

  const formatted = conversations.map((conversation) => {
    const participants: IPopulatedParticipant[] = conversation.participants.map(
      (p: any) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      })
    );

    return {
      ...conversation.toObject(),
      unreadCounts: conversation.unreadCounts || {},
      participants,
    };
  });

  return formatted;
};

// lấy tin nhắn của cuộc trò chuyện
export const getMessagesService = async (data: getMessagesQueryType) => {
  const { conversationId, limit = 50, cursor } = data;
  const query: Record<string, any> = { conversationId };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  let messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);
  // .populate([{ path: 'senderId', select: 'displayName avatarUrl' }]);

  let nextCursor = null;

  if (messages.length > limit) {
    const nextMessage = messages[messages.length - 1];
    nextCursor = nextMessage.createdAt.toISOString();
    messages.pop();
  }

  messages = messages.reverse();

  return { messages, nextCursor };
};

// lấy danh sách cuộc trò chuyện cho socket.io
export const getConversationsForSocketService = async (userId: string) => {
  const conversations = await Conversation.find(
    { 'participants.userId': userId },
    { _id: 1 }
  );

  return conversations.map((c) => c._id.toString());
};

//
export const markAsSeenService = async (
  conversationId: string,
  userId: string
) => {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation)
    throw new NotFoundException('Cuộc trò chuyện không tồn tại');

  const last = conversation.lastMessage;
  if (!last)
    return {
      message: 'Không có tin nhắn để mark as seen',
      seenBy: [],
      myUnreadCount: 0,
    };

  if (last.senderId.toString() === userId)
    return {
      message: 'Sender không cần mark as seen',
      seenBy: [],
      myUnreadCount: 0,
    };

  const updated = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $addToSet: { seenBy: userId },
      $set: { [`unreadCounts.${userId}`]: 0 },
    },
    {
      new: true,
    }
  ).populate([
    { path: 'participants.userId', select: 'displayName avatarUrl' },
  ]);

  if (!updated) throw new BadRequestException('updated error');

  const participants: IPopulatedParticipant[] = updated.participants.map(
    (p: any) => ({
      _id: p.userId?._id,
      displayName: p.userId?.displayName,
      avatarUrl: p.userId?.avatarUrl ?? null,
      joinedAt: p.joinedAt,
    })
  );

  const format = {
    ...updated.toObject(),
    participants,
  };

  console.log('updated: ', format);

  io.to(conversationId).emit('read-message', {
    conversation: format,
    lastMessage: {
      _id: updated?.lastMessage?._id,
      content: updated?.lastMessage?.content,
      createdAt: updated?.lastMessage?.createdAt,
      sender: {
        _id: updated?.lastMessage?.senderId,
      },
    },
  });

  return {
    message: 'Mark as seen',
    seenBy: updated?.seenBy || [],
    myUnreadCount: updated?.unreadCounts?.get(userId) || 0,
  };
};
