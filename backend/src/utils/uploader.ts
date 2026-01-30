import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';

// Cấu hình kho chứa trực tiếp trên Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    return {
      folder: 'NTKChat/avatar', // Tên thư mục trên Cloudinary
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Tự căn giữa khuôn mặt
        { quality: '60', fetch_format: 'webp' }, // Tự nén ảnh cho nhẹ
      ],
      public_id: `avatar-${Date.now()}`,
    };
  },
});
