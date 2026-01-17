import { useAuthStore } from '@/stores/useAuthStore';
import type { IConversation } from '@/types/chat';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ImagePlus, Send } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import TextareaAutosize from 'react-textarea-autosize';

const MessageInput = ({ selectedConvo }: { selectedConvo: IConversation }) => {
  const user = useAuthStore((s) => s.user);
  const [value, setValue] = useState('');

  if (!user) return;

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
          minRows={2}
          maxRows={10}
          placeholder="Nhập tin nhắn..."
          className="w-full px-3 p-2 bg-secondary border border-secondary-foreground/30  rounded-md 
          transition-smooth beautiful-scrollbar resize-none overflow-y-auto"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            asChild
            variant={'ghost'}
            size={'icon'}
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>{/* emoji picker */}a</div>
          </Button>
        </div>
      </div>

      {/* nút gửi */}
      <Button className="bg-sent hover:shadow-glow transition-smooth">
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
