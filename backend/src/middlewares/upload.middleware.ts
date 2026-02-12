import multer from 'multer';
import { chatMessageStorage, storage } from '../utils/uploader';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
// Middleware xử lý upload
export const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận định dạng ảnh!') as any, false);
    }
  },
}).single('file');

// ảnh tin nhắn
export const uploadMessages = multer({
  storage: chatMessageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tin nhắn cho gửi ảnh nặng hơn chút (10MB)
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Định dạng ảnh không hỗ trợ!') as any, false);
    }
  },
}).array('images', 5); // Chốt chặn: key là 'images' và tối đa 5 file
