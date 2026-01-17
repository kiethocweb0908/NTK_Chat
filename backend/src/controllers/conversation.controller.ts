import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import {
  getMessagesSchema,
  groupSchema,
} from '../validators/conversation.validator';
import * as conversationService from '../services/conversation.service';
import { HTTPSTATUS } from '../config/http.config';
import Conversation from '../models/Conversation.model';

// tạo group
export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const data = groupSchema.parse(req.body);
  const userId = req.user?._id;

  const conversation = await conversationService.createGroupService(
    data,
    userId
  );

  return res.status(HTTPSTATUS.CREATED).json({
    conversation,
  });
});

// tìm hộp thoại của mình với đối phương
export const getConversationByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userA = req.user?._id;
    const userB = req.query.userId as string;

    const conversation = await conversationService.getConversationByUserService(
      userA,
      userB
    );

    if (!conversation) return res.status(HTTPSTATUS.NO_CONTENT).send();

    return res.status(HTTPSTATUS.OK).json({ conversation });
  }
);

// lấy ds hộp thoại của bản thân
export const getConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const formatted = await conversationService.getConversationsService(userId);

    return res.status(HTTPSTATUS.OK).json({ Conversations: formatted });
  }
);

// lấy ds tn của 1 hộp thoại
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = getMessagesSchema.parse({
    ...req.query,
    conversationId: req.params.conversationId,
  });

  const data = validatedData;

  const { messages, nextCursor } = await conversationService.getMessagesService(
    data
  );

  return res.status(HTTPSTATUS.OK).json({
    messages,
    nextCursor,
  });
});
