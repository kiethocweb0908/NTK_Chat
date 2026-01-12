import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';
import { HTTPSTATUS } from '../config/http.config';
import { clearRefreshTokenCooke, setRefreshTokenCooke } from '../utils/cookie';
import Session from '../models/Session.model';

// register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const newUser = await authService.registerService(data);

  res.status(HTTPSTATUS.CREATED).json({
    message: 'User registration successful',
    user: newUser,
  });
});

// login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } = await authService.loginService(
    data
  );

  setRefreshTokenCooke(res, 'refreshToken', refreshToken);

  res.status(HTTPSTATUS.OK).json({
    message: 'Đăng nhập thành công',
    user,
    accessToken,
  });
});

// logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken && req.user) {
    await Session.deleteOne({ refreshToken });
    clearRefreshTokenCooke(res, 'refreshToken');
  } else {
    return res
      .status(HTTPSTATUS.BAD_REQUEST)
      .json({ message: 'You cannot log out without being logged in.' });
  }

  res.status(HTTPSTATUS.OK).json({
    message: 'Logout successfully',
  });
});

// refreshToken
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    const accessToken = await authService.refreshTokenService(token);

    res.status(HTTPSTATUS.OK).json({ accessToken });
  }
);
