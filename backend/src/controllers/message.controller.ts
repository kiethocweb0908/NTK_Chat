import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import {
  sendDirectMessageSchema,
  sendGroupMessageSchema,
} from '../validators/message.validator';
import * as messageService from '../services/message.service';
import { HTTPSTATUS } from '../config/http.config';

// gửi tin nhắn 1-1
export const sendDirectMessage = asyncHandler(
  async (req: Request, res: Response) => {
    // Lấy thông tin ảnh
    const files = (req.files as Express.Multer.File[]) || [];
    const uploadedImages =
      files?.map((file) => ({
        imgUrl: file.path,
        imgId: file.filename,
      })) || [];

    const dataForValidation = {
      ...req.body,
      images: uploadedImages,
    };

    const validatedData = sendDirectMessageSchema.parse(dataForValidation);
    const senderId = req.user?._id;

    const message = await messageService.sendDirectService(
      validatedData,
      senderId
    );

    res.status(HTTPSTATUS.CREATED).json({
      message,
    });
  }
);

// gửi tin nhắn group
export const sendGroupMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || [];
    // Lấy thông tin ảnh
    const uploadedImages =
      files?.map((file) => ({
        imgUrl: file.path,
        imgId: file.filename,
      })) || [];

    const dataForValidation = {
      ...req.body,
      images: uploadedImages,
    };

    const validatedData = sendGroupMessageSchema.parse(dataForValidation);
    const senderId = req.user._id;

    const message = await messageService.sendGroupService(
      validatedData,
      senderId
    );

    res.status(HTTPSTATUS.CREATED).json({
      message,
    });
  }
);

// thu hồi tin
export const recallMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { messageId } = req.params;

    const message = await messageService.recallMessageService(
      messageId.toString(),
      userId.toString()
    );

    res.status(HTTPSTATUS.OK).json({
      message: 'Thu hồi thành công',
      updatedMessage: message,
    });
  }
);
