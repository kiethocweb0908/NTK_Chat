import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOTPSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '../validators/auth.validator';
import * as authService from '../services/auth.service';
import { HTTPSTATUS } from '../config/http.config';
import { clearRefreshTokenCooke, setRefreshTokenCooke } from '../utils/cookie';
import Session from '../models/Session.model';
import { IUser } from '../models/User.model';

// register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const email = await authService.registerService(data);

  res.status(HTTPSTATUS.OK).json({
    message: `Mã OTP đã được gửi về email ${email}`,
    email,
  });
});

// verify-otp
export const verifyOTPRegister = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const { user, accessToken, refreshToken } =
      await authService.verifyOTPService(email, otp, 'REGISTER');

    if (refreshToken) setRefreshTokenCooke(res, 'refreshToken', refreshToken);

    res.status(HTTPSTATUS.CREATED).json({
      message: 'Xác thực thành công và tạo tài khoản thành công',
      user,
      accessToken,
    });
  }
);

// gửi lại otp
export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, type } = resendOTPSchema.parse(req.body);
  const result = await authService.resendOTPService({ email, type });
  res.status(HTTPSTATUS.OK).json(result);
});

// login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const { accessToken, refreshToken, user } =
    await authService.loginService(data);

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
      .json({ message: 'Bạn không thể đăng xuất khi chưa đăng nhập' });
  }

  res.status(HTTPSTATUS.OK).json({
    message: 'Logout successfully',
  });
});

// forgotPassword
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);

    const result = await authService.forgotPasswordService(email);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// verify otp forgotPassword
export const verifyOTPforgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyOTPService(
      email,
      otp,
      'FORGOT_PASSWORD'
    );
    return res.status(HTTPSTATUS.OK).json(result);
  }
);

// resetPassword
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, resetToken } = resetPasswordSchema.parse(req.body);

    const { accessToken, refreshToken, user } =
      await authService.resetPasswordService({ email, password, resetToken });

    setRefreshTokenCooke(res, 'refreshToken', refreshToken);

    res.status(HTTPSTATUS.OK).json({
      message: 'Đổi mật khẩu thành công!',
      user,
      accessToken,
    });
  }
);

// google login
export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  const { user, accessToken, refreshToken } =
    await authService.googleLoginService(token);

  setRefreshTokenCooke(res, 'refreshToken', refreshToken);

  return res.status(HTTPSTATUS.OK).json({
    message: 'Đăng nhập với Google thành công!',
    user,
    accessToken,
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
