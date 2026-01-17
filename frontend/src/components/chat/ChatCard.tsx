import { Card } from '@/components/ui/card';
import { cn, formatMessageTime, formatOnlineTime } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  lastMessage?: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
}
console.log('ChatCard Rendering...');
const ChatCard = ({
  convoId,
  name,
  timestamp,
  lastMessage,
  isActive,
  onSelect,
  unreadCount = 0,
  leftSection,
  subtitle,
}: ChatCardProps) => {
  console.log('chatCard');
  return (
    <Card
      key={convoId}
      className={cn(
        'border-none p-3 cursor-pointer transtiion hover:bg-muted/30',
        'group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:py-2 group-data-[state=collapsed]:',
        isActive && 'ring-2 ring-primary/50'
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3 ">
        {/* avatar */}
        <div className="relative">{leftSection}</div>
        {/* name và các cái khác */}
        <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                'font-semibold text-sm truncate',
                unreadCount && unreadCount > 0 && 'text-foreground'
              )}
            >
              {name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">{subtitle}</div>
            <MoreHorizontal
              className="size-4 text-muted-foreground 
            opacity-0 group-hover:opacity-100 "
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
