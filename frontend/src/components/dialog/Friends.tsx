import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import UserAvatar from '../chat/UserAvatar';
import { Button } from '../ui/button';
import SearchComponent from '../chat/SearchComponent';
import { useFriendStore } from '@/stores/useFriendStore';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';

const Friends = ({ onSuccess }: { onSuccess: () => void }) => {
  const friends = useFriendStore((s) => s.friends);
  const loading = useFriendStore((s) => s.loading);
  const searchFriends = useFriendStore((s) => s.searchFriends);
  const getFriends = useFriendStore((s) => s.getFriends);
  const isSearchingFriends = useFriendStore((s) => s.isSearchingFriends);
  const clearFriend = useFriendStore((s) => s.clearFriend);
  const hasNextPage = useFriendStore((s) => s.hasNextPage);
  const nextCursor = useFriendStore((s) => s.nextCursor);
  const chatbots = useFriendStore((s) => s.chatbots);
  const getChatBots = useFriendStore((s) => s.getChatBots);
  const handleStartChat = useChatStore((s) => s.handleStartChat);

  const [keyword, setKeyword] = useState('');

  // gọi api bạn bè
  useEffect(() => {
    if (keyword.trim()) {
      const delayDebounce = setTimeout(() => {
        searchFriends(keyword);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }

    const fetchInitialFriends = async () => {
      if (friends.length === 0 || isSearchingFriends) {
        if (isSearchingFriends) clearFriend();

        await getFriends(20);
      }
    };
    fetchInitialFriends();
  }, [keyword]);

  useEffect(() => {
    if (chatbots.length) return;

    const fetch = async () => await getChatBots();
    fetch();
  }, []);

  // cuộn
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (loading || isSearchingFriends || !hasNextPage) return;

    const target = e.currentTarget;
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isBottom) {
      await getFriends(20, nextCursor);
    }
  };

  // nhắn tin
  const onMessageClick = async (targetUserId: string) => {
    await handleStartChat(targetUserId);
    onSuccess();
  };

  return (
    <>
      <Card className="gap-2">
        <CardHeader>
          <CardTitle>Chat bot</CardTitle>
        </CardHeader>
        <CardContent>
          {chatbots.length > 0 ? (
            chatbots.map((chatbot) => (
              <div className="flex gap-4">
                <UserAvatar
                  type="chat"
                  name={chatbot.displayName}
                  avatarUrl={chatbot.avatarUrl}
                />
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <p className="text-sm">{chatbot.displayName}</p>
                    <p className="text-xs">{chatbot.bio}</p>
                  </div>
                  <Button
                    disabled={loading}
                    variant={'sent'}
                    onClick={() => onMessageClick(chatbot._id)}
                  >
                    Nhắn tin
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>Không có ai</p>
          )}
        </CardContent>
      </Card>
      <Card className="mt-2">
        <CardHeader>
          <CardTitle className="mb-4">Danh sách bạn bè</CardTitle>
          <CardDescription>
            <SearchComponent
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm bạn bè..."
            />
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm overflow-y-auto min-h-65 max-h-65">
          {friends.length ? (
            friends.map((f, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 py-2
            hover:bg-secondary"
                >
                  <UserAvatar type="chat" name={f.displayName} avatarUrl={f.avatarUrl} />
                  <div className="flex items-center justify-between flex-1">
                    <div>
                      <p>{f.displayName}</p>
                      <p className="text-xs">{f.userName}</p>
                    </div>
                    <Button
                      disabled={loading}
                      variant={'sent'}
                      onClick={() => onMessageClick(f._id)}
                    >
                      Nhắn tin
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="select-none leading-65 text-center">Không tìm thấy bạn bè</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Friends;
