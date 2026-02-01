import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { NotFoundException } from '../utils/app-error';
import { HTTPSTATUS } from '../config/http.config';
import * as userService from '../services/user.service';
import User from '../models/User.model';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new NotFoundException('Không tìm thấy người dùng');

  return res.status(HTTPSTATUS.OK).json({
    message: 'Lấy thông tin người dùng thành công!',
    user,
  });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const keyword = req.query.keyword as string;
  const me = req.user!;

  const users = await userService.searchUsersService(
    keyword,
    me._id.toString()
  );

  res.status(HTTPSTATUS.OK).json({
    users,
  });
});

export const editInformation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user._id;
    const data = req.body;

    // Khởi tạo biến để hứng thông tin ảnh
    let imageData = undefined;

    if (req.file) {
      imageData = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    if (!req.file && Object.keys(data).length === 0)
      return res.status(HTTPSTATUS.NO_CONTENT);

    const updatedUser = await userService.editInfoService(
      userId,
      data,
      imageData
    );
    res.status(HTTPSTATUS.OK).json({
      message: 'Cập nhật thông tin thành công!',
      updatedUser,
    });
  }
);

export const getAIUsers = asyncHandler(async (req: Request, res: Response) => {
  const aiBots = await User.find({ isBot: true }).select(
    '_id displayName avatarUrl userName isBot bio'
  );
  return res.status(HTTPSTATUS.OK).json({
    aiBots,
  });
});
