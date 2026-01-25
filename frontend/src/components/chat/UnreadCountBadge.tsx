import { Badge } from '../ui/badge';

const UnreadCountBadge = ({ unreadCount }: { unreadCount: number }) => {
  return (
    <div className="absolute z-10 -top-1 -right-1">
      <Badge variant={'destructive'}>{unreadCount > 9 ? '9+' : unreadCount}</Badge>
    </div>
  );
};

export default UnreadCountBadge;
