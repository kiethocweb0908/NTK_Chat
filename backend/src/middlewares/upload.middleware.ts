import multer from 'multer';
import { storage } from '../utils/uploader';

// Middleware xử lý upload
export const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận định dạng ảnh!') as any, false);
    }
  },
}).single('file');
