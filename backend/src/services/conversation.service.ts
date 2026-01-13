import path from 'path';
import Conversation from '../models/Conversation.model';
import { BadRequestException } from '../utils/app-error';
import { groupSchemaType } from '../validators/conversation.validator';
import { IPopulatedParticipant } from '../types/populated.type';

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

export const getMessagesService = async () => {};
