import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Tên nhóm phải có ít nhất 3 ký tự')
    .max(50, 'Tên nhóm tối đa 50 ký tự'),
  memberIds: z.array(z.string()).min(2, 'Vui lòng chọn ít nhất 2 thành viên'),
});

export type CreateGroupType = z.infer<typeof createGroupSchema>;
