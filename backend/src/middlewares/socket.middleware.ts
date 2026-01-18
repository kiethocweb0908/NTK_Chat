import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { Socket } from 'socket.io';
import { NotFoundException, UnauthorizedException } from '../utils/app-error';
import { Env } from '../config/env.config';

interface MyJwtPayload extends jwt.JwtPayload {
  userId: string;
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token)
      return next(new NotFoundException('Unauthorized - Token không tồn tại'));

    const decoded = jwt.verify(token, Env.ACCESS_TOKEN_SECRET) as MyJwtPayload;
    if (!decoded)
      return next(
        new UnauthorizedException(
          'Unauthorized - Token không hợp lệ hoặc đã hết hạn'
        )
      );

    const user = await User.findById(decoded.userId);
    if (!user) return next(new NotFoundException('Người dùng không tồn tại'));

    socket.user = user;

    next();
  } catch (error) {
    console.error('Lỗi khi verify JWT trong socketMiddleware: ', error);
    next(new Error('Unauthorized'));
  }
};
