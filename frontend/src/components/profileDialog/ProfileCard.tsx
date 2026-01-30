import { Card, CardContent } from '../ui/card';
import UserAvatar from '../chat/UserAvatar';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import AvatarUploader from './AvatarUploader';
import { useSocketStore } from '@/stores/useSocketStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';

const ProfileCard = () => {
  const user = useAuthStore((s) => s.user);
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const setImageFile = useUserStore((s) => s.setImageFile);
  const clearImageFile = useUserStore((s) => s.clearImageFile);

  if (!user) return;
  const isOnline = onlineUsers.includes(user._id) ? true : false;

  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const handleAvatarChanges = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageFile(file);

    // e.target.value = '';
  };

  useEffect(() => {
    // Mỗi khi image.url thay đổi, nó sẽ xóa cái url cũ của chính nó
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <Card
      className="overflow-hidden p-0 h-52 
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
    "
    >
      <CardContent className="mt-20 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
        <div className="relative">
          <UserAvatar
            type="profile"
            name={user.displayName}
            avatarUrl={imageUrl || user.avatarUrl || undefined}
            className="ring-4 ring-white shadow-lg"
          />

          <AvatarUploader handleAvatarChanges={handleAvatarChanges} />
        </div>

        {/* user info */}
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {user.displayName}
          </h1>
          <h3 className="text-lg font-medium text-white/60">{user.userName}</h3>

          {user.bio && (
            <p className="text-white/70 text-sm mt-2 max-w-lg line-clamp-2">{user.bio}</p>
          )}
        </div>

        {/* status */}
        <Badge
          className={cn(
            'flex items-center gap-1 capitalize',
            isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
          )}
        >
          <div
            className={cn(
              'size-2 rounded-full',
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
            )}
          />

          {isOnline ? 'online' : 'offline'}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
