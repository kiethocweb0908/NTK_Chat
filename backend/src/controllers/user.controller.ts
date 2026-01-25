import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { NotFoundException } from '../utils/app-error';
import { HTTPSTATUS } from '../config/http.config';
import * as userService from '../services/user.service';

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
