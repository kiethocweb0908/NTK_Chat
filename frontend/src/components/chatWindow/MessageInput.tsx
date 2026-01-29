import { useAuthStore } from '@/stores/useAuthStore';
import type { IConversation, IUserpopulate } from '@/types/chat';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ImagePlus, Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import EmojoPicker from './EmojoPicker';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

interface IMessageInput {
  selectedConvo: IConversation | null;
  tempUser: IUserpopulate | null;
}

const MessageInput = ({ selectedConvo }: IMessageInput) => {
  const user = useAuthStore((s) => s.user);
  const sendDirectMessage = useChatStore((s) => s.sendDirectMessage);
  const sendGroupMessage = useChatStore((s) => s.sendGroupMessage);
  const tempChatUser = useChatStore((s) => s.tempChatUser);
  const [value, setValue] = useState('');

  if (!user) return;

  // gửi tin
  const sendMessge = async () => {
    const messageContent = value.trim();
    if (!messageContent || (!selectedConvo && !tempChatUser)) return;

    try {
      let recipientId = '';
      let conversationId = selectedConvo?._id;

      if (selectedConvo) {
        if (selectedConvo.type === 'direct' || selectedConvo.type === 'self') {
          const otherParticipant = selectedConvo.participants.find(
            (p) => p.userId._id !== user?._id
          );
          recipientId = otherParticipant?.userId._id || user._id || '';
        }
      } else if (tempChatUser) {
        recipientId = tempChatUser._id;
      }

      const commonData = {
        content: messageContent,
        images: [],
        // conversationId,
      };
      setValue('');

      if (selectedConvo && selectedConvo.type === 'group') {
        await sendGroupMessage({ ...commonData, conversationId: conversationId! });
      } else {
        await sendDirectMessage({ ...commonData, recipientId, conversationId });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || 'Lỗi xảy ra khi gửi tin nhắn';
      toast.error(errorMessage);
    }
  };

  // enter gửi
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    const isModifierPressed = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
    if (e.key === 'Enter' && !isModifierPressed) {
      e.preventDefault();
      await sendMessge();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-14 bg-background">
      <Button
        variant={'ghost'}
        size={'icon'}
        className="hover:bg-primary/10 transition-smooth"
      >
        <ImagePlus className="size-4" />
      </Button>
      {/* khung nhắn */}
      <div className="flex-1 relative">
        <TextareaAutosize
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          minRows={2}
          maxRows={10}
          maxLength={700}
          placeholder="Nhập tin nhắn..."
          className="w-full pl-3 pr-12 p-2 bg-secondary border border-secondary-foreground/30  rounded-md 
          transition-smooth beautiful-scrollbar resize-none overflow-y-auto"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            asChild
            variant={'ghost'}
            size={'icon'}
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              <EmojoPicker onChange={(emoji: string) => setValue(`${value}${emoji}`)} />
            </div>
          </Button>
        </div>
      </div>

      {/* nút gửi */}
      <Button
        onClick={sendMessge}
        variant={null}
        className="bg-sent transition-smooth hover:shadow-glow hover:scale-105"
        disabled={!value.trim()}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
