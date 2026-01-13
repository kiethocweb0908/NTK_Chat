import { z } from 'zod';

export const sendRequestSchema = z.object({
  to: z.string(),
  message: z.string().max(300, 'Độ dài vượt quá giới hạn'),
});

export const requestIdSchema = z.object({
  requestId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không hợp lệ'),
});

export type SendRequestType = z.infer<typeof sendRequestSchema>;
