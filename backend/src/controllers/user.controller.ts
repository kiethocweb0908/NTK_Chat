import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { NotFoundException } from '../utils/app-error';
import { HTTPSTATUS } from '../config/http.config';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new NotFoundException('Không tìm thấy người dùng');

  return res.status(HTTPSTATUS.OK).json({
    message: 'Lấy thông tin người dùng thành công!',
    user,
  });
});
