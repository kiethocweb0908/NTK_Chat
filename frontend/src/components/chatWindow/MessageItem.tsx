import { cn, formatMessageTime } from '@/lib/utils';
import type { IConversation, IMessage, IParticipant } from '@/types/chat';
import UserAvatar from '../chat/UserAvatar';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface IMessageItemProps {
  message: IMessage;
  messages: IMessage[];
  index: number;
  selectedConvo: IConversation;
  lastMessageStatus: 'delivered' | 'seen';
}

const MessageItem = ({
  message,
  messages,
  index,
  selectedConvo,
  lastMessageStatus,
}: IMessageItemProps) => {
  const prev = messages[index - 1];

  const isGroupBreak =
    index === 0 ||
    message.senderId !== prev?.senderId ||
    new Date(message.createdAt).getTime() - new Date(prev?.createdAt || 0).getTime() >
      30000;

  const participant = selectedConvo.participants.find(
    (p: IParticipant) => p._id.toString() === message.senderId.toString()
  );

  console.log('message.isOwn: ', message.isOwn);

  return (
    <div
      className={cn(
        'flex gap-2 message-bounce mt-1',
        message.isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvatar
              type="chat"
              name={participant?.displayName ?? 'Người dùng'}
              avatarUrl={participant?.avatarUrl ?? undefined}
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
            'p-3',
            message.isOwn ? 'chat-bubble-sent border-0' : 'bg-received'
          )}
        >
          <p className="text-sm leading-relaxed wrap-break-word">{message.content}</p>
        </Card>

        {/* time */}
        {isGroupBreak && (
          <span className="text-xs text-muted-foreground px-1">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* status */}
        {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
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
};

export default MessageItem;
