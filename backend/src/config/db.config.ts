import mongoose from 'mongoose';
import { Env } from './env.config';
import { createBotUser } from '../seed';

export const connectDB = async () => {
  try {
    await mongoose.connect(Env.MONGO_URL);
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error: \n', error);
    process.exit(1);
  }
};

export default connectDB;
