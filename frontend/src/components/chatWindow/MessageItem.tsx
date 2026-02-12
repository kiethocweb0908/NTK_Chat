import { cn, formatMessageTime } from '@/lib/utils';
import type { IMessage } from '@/types/chat';
import UserAvatar from '../chat/UserAvatar';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import MessageActions from './MessageActions';
import { useChatStore } from '@/stores/useChatStore';
import MessageImageGrid from './MessageImageGrid';
import MessageReply from './MessageReply';
import MessageStatus from './MessageStatus';

interface IMessageItemProps {
  message: IMessage & { status?: 'sending' | 'sent' | 'error' };
  isGroupBreak: boolean;
  isEndOfGroup: boolean;
  isGroup: boolean;
  isLastMessage: boolean;
  senderName: string | undefined;
  senderAvatar?: string | null;
  lastMessageStatus: 'delivered' | 'seen';
}

const renderContentWithLargeEmojis = (content: string) => {
  if (!content) return null;
  // Regex này tìm các emoji (bao gồm cả các emoji phức tạp)
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  // Tách chuỗi thành mảng, giữ lại cả emoji để map
  const parts = content.split(emojiRegex);
  return parts.map((part, index) => {
    // Kiểm tra xem mảnh này có phải là emoji không
    if (emojiRegex.test(part)) {
      return (
        <span key={index} className="text-2xl inline-block align-middle -translate-y-1">
          {part}
        </span>
      );
    }
    // Nếu là chữ bình thường
    return <span key={index}>{part}</span>;
  });
};

const MessageItem = memo(
  ({
    message,
    isGroupBreak,
    isEndOfGroup,
    isGroup,
    isLastMessage,
    senderName,
    senderAvatar,
    lastMessageStatus,
  }: IMessageItemProps) => {
    // console.log('message.isOwn: ', message.isOwn);

    return (
      <div
        className={cn(
          'flex gap-2 message-bounce group',
          message.isOwn ? 'justify-end' : 'justify-start',
          isGroupBreak ? 'mt-2.75' : 'mt-1.5'
        )}
      >
        {/* avatar */}
        {!message.isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={senderName ?? 'Người dùng'}
                avatarUrl={senderAvatar ?? undefined}
              />
            )}
          </div>
        )}

        {/* tin nhắn, trạng thái và thời gian */}
        <div
          className={cn(
            'max-w-xs lg:max-w-md space-y-1 flex flex-col',
            message.isOwn ? 'items-end' : 'items-start',
            message.status === 'sending' && 'opacity-70'
          )}
        >
          {/* tin nhắn */}
          <div
            className={cn(
              'flex items-start',
              message.isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <Card
              className={cn(
                'p-3 gap-0',
                message.isOwn ? 'chat-bubble-sent border-0' : 'bg-received',
                message.status === 'error' && 'border border-destructive animate-shake',
                message.isDeleted && 'opacity-90 select-none'
              )}
            >
              {/* Người gửi */}
              {isGroup && isGroupBreak && !message.isOwn && (
                <p className={cn('text-xs font-bold leading-relaxed wrap-break-word')}>
                  {senderName}
                </p>
              )}

              {/* Tin trả lời */}
              {message.replyTo && !message.isDeleted && (
                <MessageReply replyTo={message.replyTo} isOwn={message.isOwn} />
              )}

              {/* Nội dung chữ */}
              <p
                className={cn(
                  'text-sm leading-relaxed wrap-break-word text-justify',
                  message.isDeleted &&
                    `${message.isOwn ? 'text-muted' : 'text-muted-foreground'} italic`
                )}
              >
                {message.isDeleted
                  ? 'Tin nhắn đã được thu hồi'
                  : renderContentWithLargeEmojis(message.content || '')}
              </p>

              {/* Ảnh */}
              {!message.isDeleted && message.images && message.images.length > 0 && (
                <MessageImageGrid images={message.images} />
              )}
            </Card>

            <MessageActions message={message} isOwn={message.isOwn} />
          </div>

          {/* Thời gian */}
          {isEndOfGroup && (
            <span className="text-xs text-muted-foreground px-1">
              {formatMessageTime(new Date(message.createdAt))}
            </span>
          )}

          {/* Hiển thị Trạng thái chi tiết */}
          {message.isOwn && (
            <MessageStatus
              status={message.status}
              isLastMessage={isLastMessage}
              lastMessageStatus={lastMessageStatus}
            />
          )}
        </div>
      </div>
    );
  }
);

export default MessageItem;
