import mongoose from 'mongoose';
import { Env } from './env.config';

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
