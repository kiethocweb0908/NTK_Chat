import Session from '../models/Session.model';
import User from '../models/User.model';
import { Conflictexception, UnauthorizedException } from '../utils/app-error';
import { createAccessToken, setRefreshTokenTLL } from '../utils/cookie';
import {
  LoginSchemaType,
  RegisterSchemaType,
} from '../validators/auth.validator';
import crypto from 'crypto';

// register
export const registerService = async (data: RegisterSchemaType) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { userName: data.userName }],
  });
  if (existingUser)
    throw new Conflictexception('Email hoặc tên đăng nhập đã tồn tại!');

  const newUser = await User.create({
    userName: data.userName,
    email: data.email,
    hashPassword: data.password,
    displayName: data.lastName + data.firstName,
  });

  return newUser;
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

  const accessToken = createAccessToken(user._id.toString());

  const refreshToken = crypto.randomBytes(64).toString('hex');

  const maxAgeInMs = setRefreshTokenTLL();

  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + maxAgeInMs),
  });

  return { accessToken, refreshToken, user };
};

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
