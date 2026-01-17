import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface IUserAvatarProps {
  type: 'header' | 'chat' | 'profile';
  name: string;
  avatarUrl?: string | null;
  className?: string;
  isGroup?: boolean;
}

const UserAvatar = ({
  type,
  name,
  avatarUrl,
  className,
  isGroup = false,
}: IUserAvatarProps) => {
  const bgColor = !avatarUrl ? 'bg-blue-400' : '';

  if (!name) {
    name = 'Người dùng';
  }

  return (
    <Avatar
      className={cn(
        className ?? '',
        type === 'header' && 'size-10 text-base',
        type === 'chat' && (!isGroup ? 'size-8 text-sm' : 'size-6 text-xs'),
        type === 'profile' && 'size-24 text-3xl shadow-md'
      )}
    >
      <AvatarImage src={avatarUrl || ''} alt={name} />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
