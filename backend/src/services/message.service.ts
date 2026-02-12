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
import { getSocketIdByUserId, io } from '../socket/index.socket';
import User from '../models/User.model';
import { handleBotResponse } from './gemini.service';
import cloudinary from '../config/cloudinary.config';

// gửi tn 1-1
export const sendDirectService = async (
  data: sendDirectMessageSchemaType,
  senderId: string
) => {
  const { recipientId, conversationId, content, images, replyTo } = data;
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

  const recipient = await User.findById(recipientId);

  // kiểm tra nếu chat với người khác
  if (!isSelf && !recipient?.isBot) {
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
    images,
    ...(replyTo ? { replyTo } : {}),
  });

  if (replyTo) {
    await message.populate({
      path: 'replyTo',
      select: 'content images isDeleted senderId',
    });

    const replyMsg = message.replyTo as any;
    if (replyMsg && replyMsg.isDeleted) {
      replyMsg.content = 'Tin nhắn đã bị thu hồi';
      replyMsg.images = [];
    }
  }

  // cập nhật hộp thoại sau khi tạo tin mới
  updateConversationAfterCreateMessage(conversation, message, senderId);
  await conversation.save();
  await conversation.populate([
    {
      path: 'participants.userId',
      select: '_id userName displayName avatarUrl isBot',
    },
    {
      path: 'lastMessage.senderId',
      select: '_id userName displayName avatarUrl',
    },
    { path: 'seenBy', select: '_id userName displayName avatarUrl' },
  ]);

  // emitNewMessage(io, conversation, message);

  if (!conversationId && conversation) {
    for (const member of conversation.participants) {
      const memberId = member.userId._id;
      const socketId = getSocketIdByUserId(memberId.toString());
      if (socketId) {
        const memberSocket = io.sockets.sockets.get(socketId);
        if (memberSocket) {
          memberSocket.join(conversation._id.toString());
        }
      }
    }
  }
  io.to(conversation._id.toString()).emit('new-message', {
    newMessage: message,
    updatedConversation: conversation,
  });

  // --- LOGIC CHATBOT ---
  // const recipient = await User.findById(recipientId);
  if (recipient?.isBot && content?.trim()) {
    // Không dùng await ở đây để Bot chạy ngầm,
    // không bắt User phải đợi Bot trả lời xong mới xong request API.
    handleBotResponse(conversation, content, recipient);
  }

  return message;
};

// gửi tn nhóm
export const sendGroupService = async (
  data: sendGroupMessageSchemaType,
  senderId: string
) => {
  const { conversationId, content, images, replyTo } = data;

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
    images,
    ...(replyTo ? { replyTo } : {}),
  });

  if (replyTo) {
    await message.populate({
      path: 'replyTo',
      select: 'content images isDeleted senderId',
    });

    const replyMsg = message.replyTo as any;
    if (replyMsg && replyMsg.isDeleted) {
      replyMsg.content = 'Tin nhắn đã bị thu hồi';
      replyMsg.images = [];
    }
  }

  updateConversationAfterCreateMessage(conversation, message, senderId);
  await conversation.save();
  await conversation.populate([
    {
      path: 'participants.userId',
      select: '_id userName displayName avatarUrl',
    },
    {
      path: 'lastMessage.senderId',
      select: '_id userName displayName avatarUrl',
    },
    { path: 'seenBy', select: '_id userName displayName avatarUrl' },
  ]);

  io.to(conversation._id.toString()).emit('new-message', {
    newMessage: message,
    updatedConversation: conversation,
  });

  return message;
};

// thu hồi tin nhắn
export const recallMessageService = async (
  messageId: string,
  userId: string
) => {
  const message = await Message.findOne({ _id: messageId, senderId: userId });

  if (!message)
    throw new NotFoundException(
      'Tin nhắn không tồn tại hoặc bạn không có quyền thu hồi'
    );

  if (message.isDeleted)
    throw new BadRequestException('Tin nhắn đã được thu hồi trước đó');

  if (message.images && message.images.length > 0) {
    const deletePromises = message.images
      .filter((img) => img.imgId)
      .map((img) => cloudinary.uploader.destroy(img.imgId as string));

    Promise.all(deletePromises)
      .then(() =>
        console.log(`Đã xóa sạch ảnh của tin nhắn ${messageId} trên mây`)
      )
      .catch((err) => console.error('Lỗi xóa ảnh ngầm:', err));
  }

  message.isDeleted = true;
  message.content = '';
  message.images = [];

  await message.save();

  const conversationId = message.conversationId.toString();
  const updatedConv = await Conversation.findOneAndUpdate(
    {
      _id: conversationId,
      'lastMessage._id': message._id.toString(),
    },
    {
      $set: { 'lastMessage.content': 'Tin nhắn đã được thu hồi' },
    }
  );

  io.to(conversationId).emit('message-recalled', {
    messageId: message._id,
    conversationId,
    ...(updatedConv && { lastMessageContent: 'Tin nhắn đã được thu hồi' }),
  });

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
