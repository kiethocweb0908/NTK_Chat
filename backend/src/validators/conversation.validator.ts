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

export type groupSchemaType = z.infer<typeof groupSchema>;
