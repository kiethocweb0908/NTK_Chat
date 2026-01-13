import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { sendDirectMessageSchema } from '../validators/message.validator';
import * as messageService from '../services/message.service';
import { HTTPSTATUS } from '../config/http.config';

// gửi tin nhắn 1-1
export const sendDirectMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const data = sendDirectMessageSchema.parse(req.body);
    const senderId = req.user?._id;

    const message = await messageService.sendDirectService(data, senderId);

    res.status(HTTPSTATUS.CREATED).json({
      message,
    });
  }
);

// gửi tin nhắn group
export const sendGroupMessage = asyncHandler(
  async (req: Request, res: Response) => {}
);
