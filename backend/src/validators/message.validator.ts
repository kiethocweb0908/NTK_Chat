import { z } from 'zod';

const ID = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không hợp lệ');

export const sendDirectMessageSchema = z
  .object({
    recipientId: ID,
    conversationId: ID.optional(),
    content: z.string().trim().optional(),
    images: z
      .array(
        z.object({
          imgUrl: z.string().url(),
          imgId: z.string(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      const hasContent = data.content && data.content.length > 0;
      const hasImages = !!data.images && data.images.length > 0;
      return hasContent || hasImages;
    },
    {
      message: 'Tin nhắn phải có nội dung văn bản hoặc hình ảnh',
      path: ['content'],
    }
  );

export type sendDirectMessageSchemaType = z.infer<
  typeof sendDirectMessageSchema
>;
