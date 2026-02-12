import { cn } from '@/lib/utils';

const MessageReply = ({ replyTo, isOwn }: { replyTo: any; isOwn: boolean }) => {
  return (
    <div
      className={cn(
        'my-1 p-2.5 rounded-sm flex flex-col gap-0.5 text-left transition-all',
        isOwn
          ? 'bg-accent/30 border-white/30 text-white'
          : 'bg-secondary-foreground/10 border-primary text-foreground'
      )}
    >
      <div className="text-xs line-clamp-2 opacity-70 leading-normal">
        {replyTo.isDeleted ? (
          <span className="italic">Tin nhắn đã được thu hồi</span>
        ) : (
          replyTo.content || (replyTo.images?.length ? '[Hình ảnh]' : '')
        )}
      </div>
    </div>
  );
};

export default MessageReply;
