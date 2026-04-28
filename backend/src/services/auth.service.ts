import { Env } from '../config/env.config';
import Otp from '../models/Otp.model';
import Session from '../models/Session.model';
import User from '../models/User.model';
import {
  BadRequestException,
  Conflictexception,
  NotFoundException,
  UnauthorizedException,
} from '../utils/app-error';
import { hashValue } from '../utils/bcrypt';
import { createAccessToken, setRefreshTokenTLL } from '../utils/cookie';
import { sendOTPMail } from '../utils/mail';
import {
  LoginSchemaType,
  RegisterSchemaType,
  resendOTPType,
  ResetPasswordType,
} from '../validators/auth.validator';
import crypto from 'crypto';

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(Env.GOOGLE_CLIENT_ID);

// tạo otp
const createOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// tạo accessToken và refreshToken cho phiên đăng nhập
export const createSession = async (userId: string) => {
  const accessToken = createAccessToken(userId);
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const maxAgeInMs = setRefreshTokenTLL();

  await Session.create({
    userId,
    refreshToken,
    expiresAt: new Date(Date.now() + maxAgeInMs),
  });
  return { accessToken, refreshToken };
};

//================================================================

// register -> otp
export const registerService = async (data: RegisterSchemaType) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { userName: data.userName }],
  });
  if (existingUser)
    throw new Conflictexception('Email hoặc tên đăng nhập đã tồn tại!');

  // 1. Tạo OTP 6 số
  const otp = createOTP();

  // 2. Hash mật khẩu trước khi lưu vào bảng OTP (Vệ sĩ lớp 1)
  const hashedPw = await hashValue(data.password);

  // 3. Xóa các yêu cầu đăng ký cũ của email này (nếu có) để tránh rác
  await Otp.deleteOne({ email: data.email, type: 'REGISTER' });

  // 4. Lưu thông tin tạm thời vào bảng Otp
  await Otp.create({
    email: data.email,
    otp,
    type: 'REGISTER',
    pendingData: {
      userName: data.userName,
      displayName: `${data.lastName} ${data.firstName}`,
      hashPassword: hashedPw,
    },
  });

  // 5. Gửi mail
  await sendOTPMail(data.email, otp, data.firstName);

  return data.email;
};

// login
export const loginService = async (data: LoginSchemaType) => {
  const user = await User.findOne({
    $or: [{ email: data.identifier }, { userName: data.identifier }],
  });

  if (!user)
    throw new UnauthorizedException(
      'Tên đăng nhập hoặc mật khẩu không chính xác'
    );

  const passwordCorrect = await user.comparaValue(data.password);
  if (!passwordCorrect)
    throw new UnauthorizedException(
      'Tên đăng nhập hoặc mật khẩu không chính xác'
    );

  if (user.resetPasswordToken) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }

  const { accessToken, refreshToken } = await createSession(
    user._id.toString()
  );

  return { accessToken, refreshToken, user };
};

// quên mật khẩu
export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundException('Email không tồn tại trong hệ thống');

  const otp = createOTP();

  await Otp.findOneAndUpdate(
    { email, type: 'FORGOT_PASSWORD' },
    { otp, attempts: 0, createdAt: new Date() },
    { upsert: true, new: true }
  );

  await sendOTPMail(email, otp, user.userName, 'FORGOT_PASSWORD');

  return { message: 'Mã OTP đã được gửi vào email của bạn' };
};

// Xác thực OTP
export const verifyOTPService = async (
  email: string,
  otp: string,
  type: 'REGISTER' | 'FORGOT_PASSWORD'
) => {
  const otpRecord = await Otp.findOne({ email, type });

  if (!otpRecord)
    throw new NotFoundException('Mã xác thực không tồn tại hoặc hết hạn');
  if (otpRecord.attempts >= 5) {
    await otpRecord.deleteOne();
    throw new BadRequestException('Sai quá nhiều lần, vui lòng yêu cầu mã mới');
  }
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new BadRequestException('Mã OTP không chính xác');
  }

  if (type === 'REGISTER') {
    // OTP ĐÚNG -> Tạo User thật
    const { userName, displayName, hashPassword } = otpRecord.pendingData!;
    const newUser = await User.create({
      userName,
      email,
      hashPassword, // Đã là hash nên User Schema pre-save sẽ check và bỏ qua
      displayName,
    });

    await otpRecord.deleteOne();

    const { accessToken, refreshToken } = await createSession(
      newUser._id.toString()
    );

    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  if (type === 'FORGOT_PASSWORD') {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await user.save();

    await otpRecord.deleteOne();

    return {
      message: 'Xác thực thành công',
      resetToken,
    };
  }
  throw new BadRequestException('Yêu cầu không hợp lệ');
};

// đổi mật khẩu
export const resetPasswordService = async ({
  email,
  password,
  resetToken,
}: ResetPasswordType) => {
  const user = await User.findOne({
    email,
    resetPasswordToken: resetToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user)
    throw new UnauthorizedException('Mã xác nhận không hợp lệ hoặc đã hết hạn');

  user.hashPassword = await hashValue(password);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const tokens = await createSession(user._id.toString());

  return { ...tokens, user };
};

// gửi lại mã otp
export const resendOTPService = async ({ email, type }: resendOTPType) => {
  // 1. Tìm bản ghi OTP cũ để lấy lại thông tin đã nhập
  const existingOtp = await Otp.findOne({ email, type });
  if (!existingOtp) {
    throw new NotFoundException('Yêu cầu đã hết hạn. Vui lòng đăng ký lại!');
  }

  // 2. Tạo mã OTP mới bảo mật
  const newOtp = createOTP();

  // 3. Cập nhật lại bản ghi đó
  existingOtp.otp = newOtp;
  existingOtp.attempts = 0;
  existingOtp.expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await existingOtp.save();

  // 4. Gửi lại mail
  const firstName =
    existingOtp.pendingData?.displayName?.split(' ').pop() || 'bạn';
  await sendOTPMail(email, newOtp, firstName, type);

  return { message: 'Mã OTP mới đã được gửi thành công!' };
};

// đăng nhập với google
export const googleLoginService = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: Env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, given_name, picture, sub } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      userName: `${email.split('@')[0]}_${Math.random().toString(36).slice(-4)}`,
      avatarUrl: picture,
      displayName: given_name || name,
      googleId: sub,
    });
  }
  if (!user.googleId) {
    user.googleId = sub;
    await user.save();
  }

  const { accessToken, refreshToken } = await createSession(
    user._id.toString()
  );

  return { user, accessToken, refreshToken };
};

//======================================================

// rerfreshToken
export const refreshTokenService = async (token: string) => {
  if (!token) throw new UnauthorizedException('Token không tồn tại');

  const session = await Session.findOne({ refreshToken: token });
  if (!session)
    throw new UnauthorizedException('Token hết hạn hoặc không tồn tại');

  if (session.expiresAt < new Date())
    throw new UnauthorizedException('Token đã hết hạn');

  const accessToken = createAccessToken(session.userId.toString());

  return accessToken;
};
