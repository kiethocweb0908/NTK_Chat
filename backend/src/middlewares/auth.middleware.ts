import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from './asyncHandler.middleware';
import { NotFoundException, UnauthorizedException } from '../utils/app-error';
import jwt from 'jsonwebtoken';
import { Env } from '../config/env.config';
import User from '../models/User.model';

interface MyJwtPayload extends jwt.JwtPayload {
  userId: string;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) throw new NotFoundException('Không tìm thấy token');

    try {
      const decoded = jwt.verify(
        token,
        Env.ACCESS_TOKEN_SECRET
      ) as MyJwtPayload;

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Token hết hạn hoặc không tồn tại');
    }
  }
);
