import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { useChatStore } from '@/stores/useChatStore';

const ReplyPreview = () => {
  const message = useChatStore((s) => s.replyingMessage);
  const setReplyingMessage = useChatStore((s) => s.setReplyingMessage);
  if (!message) return null;

  const handlecancelReply = () => {
    setReplyingMessage(null);
  };

  return (
    <div className="flex items-center justify-between bg-secondary/60 p-2 px-4 border-l-4 border-sent animate-in slide-in-from-bottom-2 duration-300 rounded-t-md ">
      <div className="flex flex-col overflow-hidden leading-tight">
        <span className="text-[11px] font-bold text-sent tracking-wider">Trả lời</span>
        <p className="text-sm truncate text-muted-foreground italic">
          {message.content || (message.images?.length > 0 ? '[Hình ảnh]' : 'Tin nhắn')}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlecancelReply}
        className="size-6 hover:bg-background/80 rounded-full transition-smooth"
      >
        <X className="size-3" />
      </Button>
    </div>
  );
};

export default ReplyPreview;
