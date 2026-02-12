import { cn, formatMessageTime } from '@/lib/utils';
import type { IMessage } from '@/types/chat';
import UserAvatar from '../chat/UserAvatar';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import MessageActions from './MessageActions';

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

        {/* tin nhắn */}

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
              {isGroup && isGroupBreak && !message.isOwn && (
                <p className={cn('text-xs font-bold leading-relaxed wrap-break-word')}>
                  {senderName}
                </p>
              )}

              {/* HIỂN THỊ TIN NHẮN GỐC (REPLY BOX) */}
              {message.replyTo && !message.isDeleted && (
                <div
                  className={cn(
                    'my-1 p-2.5 rounded-sm flex flex-col gap-0.5 text-left transition-all',
                    // Nếu là tin của mình gửi, phần reply nên sáng/mờ hơn để nổi nội dung chính
                    message.isOwn
                      ? 'bg-accent/30 border-white/30 text-white'
                      : 'bg-secondary-foreground/10 border-primary text-foreground'
                  )}
                >
                  {/* <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold uppercase opacity-80">
                      {message.replyTo.isOwn
                        ? 'Bạn'
                        : message.replyTo.senderId?.name || 'Người dùng'}
                    </span>
                  </div> */}

                  <div className="text-xs line-clamp-2 opacity-70 leading-normal">
                    {message.replyTo.isDeleted ? (
                      <span className="italic">Tin nhắn đã được thu hồi</span>
                    ) : (
                      message.replyTo.content ||
                      (message.replyTo.images?.length ? '[Hình ảnh]' : '')
                    )}
                  </div>
                </div>
              )}

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
            </Card>

            <MessageActions message={message} isOwn={message.isOwn} />
          </div>

          {/* time */}
          {isEndOfGroup && (
            <span className="text-xs text-muted-foreground px-1">
              {formatMessageTime(new Date(message.createdAt))}
            </span>
          )}

          {/* Hiển thị Trạng thái chi tiết */}
          {message.isOwn && (
            <div className="flex items-center gap-1 px-1">
              {/* Đang gửi: Hiện icon xoay nhẹ */}
              {message.status === 'sending' && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang gửi...
                </span>
              )}

              {/* Lỗi: Hiện chữ Đỏ */}
              {message.status === 'error' && (
                <span className="text-[10px] text-destructive font-medium flex items-center gap-1">
                  ⚠️ Gửi lỗi
                </span>
              )}

              {/* Tin nhắn thật: Hiện Đã gửi/Đã xem như cũ */}
              {!message.status || message.status === 'sent'
                ? isLastMessage && (
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
                  )
                : null}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default MessageItem;
