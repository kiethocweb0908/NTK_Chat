import Conversation, { IConversation } from '../models/Conversation.model';
import Message from '../models/Message.model';
import {
  sendDirectMessageSchemaType,
  sendGroupMessageSchemaType,
} from '../validators/message.validator';
import {
  checkMessageSpamLimit,
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from '../utils/messageHelper';
import { BadRequestException, NotFoundException } from '../utils/app-error';
import mongoose from 'mongoose';
import { io } from '../socket/index.socket';

// gửi tn 1-1
export const sendDirectService = async (
  data: sendDirectMessageSchemaType,
  senderId: string
) => {
  const { recipientId, conversationId, content, images } = data;
  const isSelf = recipientId.toString() === senderId.toString();
  let conversation;

  // tìm hộp thoại hiện có
  conversation = await findExistingConversation(
    isSelf,
    conversationId,
    senderId,
    recipientId
  );

  // tạo hộp thoại nếu trước đó chưa có
  if (!conversation) {
    conversation = await Conversation.create({
      type: isSelf ? 'self' : 'direct',
      participants: isSelf
        ? [{ userId: senderId, joinedAt: new Date() }]
        : [
            { userId: senderId, joinedAt: new Date() },
            { userId: recipientId, joinedAt: new Date() },
          ],
    });
  }

  // kiểm tra nếu chat với người khác
  if (!isSelf) {
    // kiểm tra người gửi/nhận có nằm trong hội thoại
    validateParticipant(
      conversation,
      senderId.toString(),
      recipientId.toString()
    );

    // Kiểm tra bạn bè và tránh spam
    const limit = await checkMessageSpamLimit(
      senderId.toString(),
      recipientId.toString(),
      conversation._id.toString()
    );
    if (!limit.allowed) throw new BadRequestException(limit.message);
  }

  // tạo tin nhắn
  const message = await Message.create({
    conversationId: conversation._id,
    senderId,
    content,
    // sau này thêm ảnh
  });

  // cập nhật hộp thoại sau khi tạo tin mới
  updateConversationAfterCreateMessage(conversation, message, senderId);
  await conversation.save();

  emitNewMessage(io, conversation, message);

  return message;
};

// gửi tn nhóm
export const sendGroupService = async (
  data: sendGroupMessageSchemaType,
  senderId: string
) => {
  const { conversationId, content, images } = data;

  // tìm hộp thoại
  const conversation = await Conversation.findOne({
    _id: conversationId,
    'participants.userId': senderId,
  });
  if (!conversation)
    throw new NotFoundException(
      'Không tìm thấy hội thoại hoặc bạn không phải thành viên'
    );

  const message = await Message.create({
    conversationId: conversation._id,
    senderId,
    content,
    // sau này thêm ảnh
  });

  updateConversationAfterCreateMessage(conversation, message, senderId);
  await conversation.save();

  emitNewMessage(io, conversation, message);

  return message;
};

//===============================================================
//=======================HELPER FUNCTION=========================

// Kiểm tra thành viên trong hộp thoại
const validateParticipant = (
  conversation: IConversation,
  senderId: string,
  recipientId: string
) => {
  const pIds = conversation.participants.map((p) => p.userId.toString());
  if (!pIds.includes(senderId) || !pIds.includes(recipientId))
    throw new BadRequestException('Bạn không phải thành viện của hội thoại');
};

// tìm conversation
const findExistingConversation = async (
  isSelf: boolean,
  conversationId: string | undefined,
  senderId: string,
  recipientId: string
) => {
  // nếu có id hộp thoại
  if (conversationId) {
    return await Conversation.findOne({
      _id: conversationId,
      type: isSelf ? 'self' : 'direct',
      'participants.userId': senderId,
    });
  }

  // tìm hộp thoại của chính mình
  if (isSelf) {
    return await Conversation.findOne({
      type: 'self',
      'participants.userId': senderId,
    });
  }

  // tìm hộp thoại của mình với người nhận
  return await Conversation.findOne({
    type: 'direct',
    participants: { $size: 2 },
    'participants.userId': { $all: [senderId, recipientId] },
  });
};
