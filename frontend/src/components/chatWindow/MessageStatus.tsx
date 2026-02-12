import { Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const MessageStatus = ({ status, isLastMessage, lastMessageStatus }: any) => {
  return (
    <div className="flex items-center gap-1 px-1">
      {status === 'sending' && (
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Đang gửi...
        </span>
      )}
      {status === 'error' && (
        <span className="text-[10px] text-destructive font-medium flex items-center gap-1">
          ⚠️ Gửi lỗi
        </span>
      )}
      {(!status || status === 'sent') && isLastMessage && (
        <Badge
          variant="outline"
          className={cn(
            'text-xs px-1.5 py-0.5 h-4 border-0',
            lastMessageStatus === 'seen'
              ? 'bg-primary/20 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {lastMessageStatus === 'delivered' ? 'Đã gửi' : 'Đã xem'}
        </Badge>
      )}
    </div>
  );
};

export default MessageStatus;
