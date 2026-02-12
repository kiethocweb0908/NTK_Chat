import { useAuthStore } from '@/stores/useAuthStore';
import type { IConversation, IUserpopulate } from '@/types/chat';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import EmojoPicker from './EmojoPicker';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';
import ReplyPreview from './ReplyPreview';
import ImageSelectedPreview from './ImageSelectedPreview';
import ImagePicker from './ImagePicker';

interface IMessageInput {
  selectedConvo: IConversation | null;
  tempUser: IUserpopulate | null;
}

const MessageInput = ({ selectedConvo }: IMessageInput) => {
  const user = useAuthStore((s) => s.user);
  const sendDirectMessage = useChatStore((s) => s.sendDirectMessage);
  const sendGroupMessage = useChatStore((s) => s.sendGroupMessage);
  const tempChatUser = useChatStore((s) => s.tempChatUser);
  const replyingMessage = useChatStore((s) => s.replyingMessage);
  const setReplyingMessage = useChatStore((s) => s.setReplyingMessage);
  const selectedImages = useChatStore((s) => s.selectedImages);
  const clearImages = useChatStore((s) => s.clearImages);
  const [value, setValue] = useState('');

  if (!user) return;

  // gửi tin
  const sendMessge = async () => {
    const messageContent = value.trim();
    if (
      (!messageContent && selectedImages.length === 0) ||
      (!selectedConvo && !tempChatUser)
    )
      return;

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

      // TẠO FORMDATA TẠI ĐÂY
      const formData = new FormData();
      formData.append('content', messageContent);

      // Đưa mảng ảnh vào FormData
      if (selectedImages && selectedImages.length) {
        selectedImages.forEach((file) => {
          formData.append('images', file);
        });
        clearImages();
      }

      if (replyingMessage) {
        formData.append('replyTo', replyingMessage._id);
        setReplyingMessage(null);
      }
      setValue('');

      if (selectedConvo && selectedConvo.type === 'group') {
        formData.append('conversationId', conversationId!);
        await sendGroupMessage(formData);
      } else {
        if (recipientId) formData.append('recipientId', recipientId);
        if (conversationId) formData.append('conversationId', conversationId);
        await sendDirectMessage(formData);
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
    <>
      {/* trả lời */}
      <ReplyPreview />

      {/* ảnh */}
      <ImageSelectedPreview />

      {/* input */}
      <div className="flex items-center gap-2 p-3 min-h-14 bg-background">
        {/* Chọn ảnh */}
        <ImagePicker />

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
          disabled={!value.trim() && !selectedImages.length}
        >
          <Send className="size-4 text-white" />
        </Button>
      </div>
    </>
  );
};

export default MessageInput;
