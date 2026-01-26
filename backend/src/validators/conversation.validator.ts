import { z } from 'zod';

export const groupSchema = z
  .object({
    name: z.string().optional(),
    memberIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.memberIds.length < 2) {
      ctx.addIssue({
        path: ['memberIds'],
        message: 'Group cần ít nhất 3 thành viên',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const getMessagesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
  conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID không hợp lệ'),
});

export type getMessagesQueryType = z.infer<typeof getMessagesSchema>;
export type groupSchemaType = z.infer<typeof groupSchema>;
