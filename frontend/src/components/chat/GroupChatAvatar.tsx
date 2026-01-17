import type { IParticipant } from '@/types/chat';
import React from 'react';
import UserAvatar from './UserAvatar';
import { Ellipsis } from 'lucide-react';

interface GroupChatAvatarProps {
  participants: IParticipant[];
  type: 'chat' | 'header';
}

const GroupChatAvatar = ({ participants, type }: GroupChatAvatarProps) => {
  const avatars = [];
  const limit = Math.min(participants.length, 3);

  for (let i = 0; i < limit; i++) {
    const member = participants[i];
    avatars.push(
      <UserAvatar
        key={i}
        type={type}
        name={member.displayName}
        avatarUrl={member.avatarUrl ?? undefined}
        isGroup={true}
      />
    );
  }

  return (
    <div
      className={`relative
    *:data-[slot=avatar]:ring-background
    *:data-[slot=avatar]:ring-2
    ${type === 'chat' && 'grid grid-cols-2 -space-x-2 -space-y-2'}
    ${type === 'header' && 'flex -space-x-1'}`}
    >
      {avatars}

      {/* nếu nhiều hơn 4 avatar */}
      {participants.length > limit && (
        <div
          className="flex items-center z-10 justify-center size-6 rounded-full
            bg-muted ring-2 ring-background text-muted-foreground"
        >
          <Ellipsis className="size-4" />
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;
