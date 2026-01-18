import { cn, formatMessageTime } from '@/lib/utils';
import type { IConversation, IMessage, IParticipant } from '@/types/chat';
import UserAvatar from '../chat/UserAvatar';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { memo } from 'react';

interface IMessageItemProps {
  message: IMessage;
  isGroupBreak: boolean;
  isEndOfGroup: boolean;
  isGroup: boolean;
  isLastMessage: boolean;
  senderName: string | undefined;
  senderAvatar?: string | null;
  lastMessageStatus: 'delivered' | 'seen';
}

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
    console.log('message.isOwn: ', message.isOwn);

    return (
      <div
        className={cn(
          'flex gap-2 message-bounce',
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

        {/* tin nhắn */}

        <div
          className={cn(
            'max-w-xs lg:max-w-md space-y-1 flex flex-col',
            message.isOwn ? 'items-end' : 'items-start'
          )}
        >
          <Card
            className={cn(
              'p-3 gap-0',
              message.isOwn ? 'chat-bubble-sent border-0' : 'bg-received'
            )}
          >
            {isGroup && isGroupBreak && !message.isOwn && (
              <p className={cn('text-xs font-bold leading-relaxed wrap-break-word')}>
                {senderName}
              </p>
            )}
            <p className="text-sm leading-relaxed wrap-break-word">{message.content}</p>
          </Card>

          {/* time */}
          {isEndOfGroup && (
            <span className="text-xs text-muted-foreground px-1">
              {formatMessageTime(new Date(message.createdAt))}
            </span>
          )}

          {/* status */}
          {message.isOwn && isLastMessage && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs px-1.5 py-0.5 h-4 border-0',
                lastMessageStatus === 'seen'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {lastMessageStatus == 'delivered' && 'Đã gửi'}
              {lastMessageStatus == 'seen' && 'Đã xem'}
            </Badge>
          )}
        </div>
      </div>
    );
  }
);

export default MessageItem;
