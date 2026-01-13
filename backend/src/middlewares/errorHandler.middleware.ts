import { ErrorRequestHandler } from 'express';
import { HTTPSTATUS } from '../config/http.config';
import { AppError } from '../utils/app-error';

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): any => {
  console.log(`Error occurred: ${req.path}`, error);

  const isAppError =
    error instanceof AppError || (error.statusCode && error.errorCode);

  if (isAppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  // Xử lý lỗi Zod (Nếu bạn dùng Zod validate ở Controller)
  if (error.name === 'ZodError') {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: 'Dữ liệu không hợp lệ',
      errors: error.errors,
    });
  }

  // Lỗi mặc định (500)
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: error?.message || 'Something went wrong',
  });
};
