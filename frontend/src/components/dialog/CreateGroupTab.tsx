import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import UserAvatar from '../chat/UserAvatar';
import { Button } from '../ui/button';
import SearchComponent from '../chat/SearchComponent';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useFriendStore } from '@/stores/useFriendStore';
import { useEffect, useState } from 'react';
import { createGroupSchema, type CreateGroupType } from '@/schemas/conversation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

const CreateGroupTab = ({ onSuccess }: { onSuccess: () => void }) => {
  const friends = useFriendStore((s) => s.friends);
  const loading = useFriendStore((s) => s.loading);
  const searchFriends = useFriendStore((s) => s.searchFriends);
  const getFriends = useFriendStore((s) => s.getFriends);
  const isSearchingFriends = useFriendStore((s) => s.isSearchingFriends);
  const clearFriend = useFriendStore((s) => s.clearFriend);
  const hasNextPage = useFriendStore((s) => s.hasNextPage);
  const nextCursor = useFriendStore((s) => s.nextCursor);
  const createGroup = useChatStore((s) => s.createGroup);

  const [keyword, setKeyword] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  // gọi api bạn bè
  useEffect(() => {
    if (keyword.trim()) {
      const delayDebounce = setTimeout(() => {
        searchFriends(keyword);
      }, 300);

      console.log(1);
      return () => clearTimeout(delayDebounce);
    }

    const fetchInitialFriends = async () => {
      if (friends.length === 0 || isSearchingFriends) {
        if (isSearchingFriends) {
          clearFriend();
        }
        console.log(2);

        await getFriends(20);
      }
    };
    fetchInitialFriends();
    console.log(3);
  }, [keyword]);

  // cuộn
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (loading || isSearchingFriends || !hasNextPage) return;

    const target = e.currentTarget;
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isBottom) {
      await getFriends(20, nextCursor);
    }
  };

  // Khởi tạo Hook Form
  const form = useForm<CreateGroupType>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      memberIds: [],
    },
    mode: 'all',
  });

  // chọn
  const toggleSelect = (userId: string) => {
    const current = form.getValues('memberIds');
    if (current.includes(userId)) {
      form.setValue(
        'memberIds',
        current.filter((id) => id !== userId),
        { shouldValidate: true }
      );
    } else {
      form.setValue('memberIds', [...current, userId], { shouldValidate: true });
    }
    // setSelectedUserIds((prev) =>
    //   prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    // );
  };

  const onSubmit = async (data: CreateGroupType) => {
    // data ĐÃ ĐƯỢC ZOD VALIDATE
    try {
      const message = await createGroup(data);
      toast.success(message);
      onSuccess();
    } catch (error: any) {
      const message = error.respone.data.message || 'Lỗi khi tạo group';
      toast.error(message);
    }
  };

  const selectedMemberIds = form.watch('memberIds');
  const selectedUsers = friends.filter((f) => selectedMemberIds.includes(f._id));
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="shadow-none">
        <CardHeader>
          {/* <CardTitle className="mb-4">Tạo nhóm</CardTitle> */}
          <CardDescription className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Tên nhóm</Label>
              <Input {...form.register('name')} placeholder="Tên nhóm..." />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between min-h-7">
              <span>Đã chọn: </span>
              {selectedUsers.length > 0 && (
                <div className="flex mt-1">
                  {selectedUsers.map((u) => {
                    return (
                      <div key={u._id}>
                        <UserAvatar
                          type="chat"
                          isGroup={true}
                          name={u.displayName}
                          avatarUrl={u.avatarUrl}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2">Danh sách bạn bè</Label>
              <SearchComponent
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm bạn bè..."
              />
              {form.formState.errors.memberIds && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.memberIds.message}
                </p>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent
          onScroll={handleScroll}
          className="text-muted-foreground text-sm  overflow-y-auto min-h-50 max-h-50 beautiful-scrollbar"
        >
          {!loading ? (
            !friends.length ? (
              <p className="text-center leading-50 select-none">Không tìm thấy bạn bè</p>
            ) : (
              friends.map((f, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-2
            hover:bg-secondary"
                  >
                    <Checkbox
                      // checked={selectedUserIds.includes(f._id)}
                      // onCheckedChange={() => toggleSelect(f._id)}
                      checked={form.watch('memberIds').includes(f._id)}
                      onCheckedChange={() => toggleSelect(f._id)}
                    />
                    <UserAvatar
                      type="chat"
                      name={f.displayName}
                      avatarUrl={f.avatarUrl}
                    />
                    <div>
                      <p className="textsm truncate">{f.displayName}</p>
                      <p className="text-xs">{f.userName}</p>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <p className="text-center leading-50 select-none">Đang tìm...</p>
          )}
        </CardContent>
        {/* <AlertDialogAction className="bg-primary">Tạo nhóm</AlertDialogAction> */}
      </Card>

      <Button variant={'sent'} className="w-full py-4 mt-4">
        Tạo nhóm
      </Button>
    </form>
  );
};

export default CreateGroupTab;
