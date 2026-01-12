import Jwt from 'jsonwebtoken';
import { Env } from '../config/env.config';
import { Response } from 'express';
import ms, { StringValue } from 'ms';

type Time = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'}`;

export const setRefreshTokenTLL = () => {
  return Env.REFRESH_TOKEN_TTL
    ? ms(Env.REFRESH_TOKEN_TTL as StringValue)
    : 14 * 24 * 60 * 60 * 1000;
};

export const createAccessToken = (userId: string) => {
  const payload = { userId };
  const expiresIn = Env.ACCESS_TOKEN_TTL as Time;
  return Jwt.sign(payload, Env.ACCESS_TOKEN_SECRET, {
    audience: ['User'],
    expiresIn: expiresIn || '10m',
  });
};

export const setRefreshTokenCooke = (
  res: Response,
  nameToken: string,
  token: string
) => {
  const maxAgeInMs = setRefreshTokenTLL();

  res.cookie(nameToken, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeInMs,
  });
};

export const clearRefreshTokenCooke = (res: Response, nameToken: string) => {
  res.clearCookie(nameToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};
