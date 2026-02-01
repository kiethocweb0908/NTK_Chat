// components/chat/TypingIndicator.tsx
import { cn } from '@/lib/utils';
import UserAvatar from '../chat/UserAvatar';

const TypingIndicator = ({ name, avatar }: { name?: string; avatar?: string | null }) => {
  return (
    <div className="flex gap-2 mt-2 mb-4 items-start animate-in fade-in slide-in-from-bottom-2">
      <div className="w-8">
        <UserAvatar type="chat" name={name ?? 'AI'} avatarUrl={avatar ?? undefined} />
      </div>
      <div className="bg-received p-3 rounded-2xl rounded-tl-none w-fit shadow-sm">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
