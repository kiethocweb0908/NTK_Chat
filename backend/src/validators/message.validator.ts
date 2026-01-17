import { z } from 'zod';

const ID = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không hợp lệ');

// 1. Schema chung cho tất cả loại tin nhắn
const baseMessageSchema = z.object({
  content: z.string().trim().optional(),
  images: z
    .array(
      z.object({
        imgUrl: z.string().url(),
        imgId: z.string(),
      })
    )
    .optional(),
});

// Hàm kiểm tra tin nhắn không được rỗng (Dùng chung)
const messageNotEmpty = (data: any) => {
  const hasContent = data.content && data.content.length > 0;
  const hasImages = !!data.images && data.images.length > 0;
  return hasContent || hasImages;
};

// 2. Schema cho tin nhắn Direct (Cần recipientId)
export const sendDirectMessageSchema = baseMessageSchema
  .extend({
    recipientId: ID,
    conversationId: ID.optional(),
  })
  .refine(messageNotEmpty, {
    message: 'Tin nhắn phải có nội dung hoặc hình ảnh',
    path: ['content'],
  });

// 3. Schema cho tin nhắn Group (Cần conversationId của nhóm)
export const sendGroupMessageSchema = baseMessageSchema
  .extend({
    conversationId: ID,
  })
  .refine(messageNotEmpty, {
    message: 'Tin nhắn nhóm phải có nội dung hoặc hình ảnh',
    path: ['content'],
  });

export type sendDirectMessageSchemaType = z.infer<
  typeof sendDirectMessageSchema
>;

export type sendGroupMessageSchemaType = z.infer<typeof sendGroupMessageSchema>;
