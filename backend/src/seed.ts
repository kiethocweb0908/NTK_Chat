import mongoose from 'mongoose';
import User from './models/User.model';
import app from './app';
import { Env } from './config/env.config';

export const createBotUser = async () => {
  try {
    const botExists = await User.findOne({ isBot: true });
    if (!botExists) {
      await User.create({
        userName: 'NTK_AI',
        displayName: 'NTK AI',
        isBot: true,
        avatarUrl:
          'https://res.cloudinary.com/dwqyyav8v/image/upload/v1769871643/gemini-color_xgiqim.webp',
      });
      console.log('--- ✅ Đã tạo Chatbot NTK AI thành công ---');
    }
  } catch (error) {
    console.error('--- ❌ Lỗi tạo Chatbot:', error);
  }
};
