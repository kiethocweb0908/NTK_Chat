import { MoreHorizontal, MoreVertical, Reply, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore } from '@/stores/useChatStore';
import type { IMessage } from '@/types/chat';
import { toast } from 'sonner';

interface MessageActionsProps {
  message: IMessage;
  isOwn: boolean;
}

const MessageActions = ({ message, isOwn }: MessageActionsProps) => {
  //   const setReplyingMessage = useChatStore((s) => s.setReplyingMessage);
  const recallMessage = useChatStore((s) => s.recallMessage);
  const setReplyingMessage = useChatStore((s) => s.setReplyingMessage);

  if (message.isDeleted) return null;

  // thu hồi
  const handleRecall = async () => {
    try {
      const res = await recallMessage(message._id);
      toast.info(res);
    } catch (error: any) {
      console.error('Lỗi khi thu hồi tin nhắn:', error);
      toast.error(error.response.data?.message);
    }
  };

  // trả lời
  const handleReply = () => {
    setReplyingMessage(message);
  };

  return (
    <div className="h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className=" p-1 hover:bg-secondary rounded-full text-muted-foreground focus:outline-none transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isOwn ? 'left' : 'right'}
          align="start"
          sideOffset={-10}
          //   alignOffset={0}
          className="w-32 animate-in fade-in zoom-in-95"
        >
          {/* Nút Trả lời */}
          <DropdownMenuItem
            onClick={() => handleReply()}
            className="cursor-pointer gap-2"
          >
            <Reply className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Trả lời</span>
          </DropdownMenuItem>

          {/* Nút Thu hồi */}
          {isOwn && (
            //   !isBot &&
            <DropdownMenuItem
              onClick={handleRecall}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Thu hồi</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MessageActions;
