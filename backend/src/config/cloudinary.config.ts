// config/cloudinary.config.js
import { v2 as cloudinary } from 'cloudinary';
import { getEnv } from '../utils/get-env';
import { Env } from './env.config';
// import dotenv from 'dotenv';

// dotenv.config();

cloudinary.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
