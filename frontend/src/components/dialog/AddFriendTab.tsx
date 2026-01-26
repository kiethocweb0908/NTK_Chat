import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchComponent from '../chat/SearchComponent';
import RequestReceived from './RequestReceived';
import RequestSentTab from './RequestSentTab';
import UserAvatar from '../chat/UserAvatar';
import { useEffect, useState } from 'react';
import { useFriendStore } from '@/stores/useFriendStore';
import AddFriendActions from './AddFriendActions';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

const AddFriendTab = () => {
  const searchUsers = useFriendStore((s) => s.searchUsers);
  const users = useFriendStore((s) => s.users);
  const clearUsers = useFriendStore((s) => s.clearUsers);
  const sendFriendRequest = useFriendStore((s) => s.sendFriendRequest);
  const declineFriendRequest = useFriendStore((s) => s.declineFriendRequest);
  const acceptFriendRequest = useFriendStore((s) => s.acceptFriendRequest);
  const deleteFriend = useFriendStore((s) => s.deleteFriend);
  const sent = useFriendStore((s) => s.sent);
  const received = useFriendStore((s) => s.received);
  const getFriendRequest = useFriendStore((s) => s.getFriendRequest);
  const hasFetched = useFriendStore((s) => s.hasFetched);

  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (!hasFetched) {
      getFriendRequest();
    }
  }, [hasFetched, getFriendRequest]);

  // search
  useEffect(() => {
    if (!keyword.trim()) {
      clearUsers();
      return;
    }

    const timeout = setTimeout(async () => {
      await searchUsers(keyword.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [keyword, searchUsers]);

  const handleSendRequest = async (to: string) => {
    try {
      const message = await sendFriendRequest(to);
      toast.success(message);
    } catch (error: any) {
      // Nếu store của bạn throw error, nó sẽ nhảy vào đây
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    }
  };

  const handleAccept = async (requestId?: string) => {
    if (!requestId) return;
    try {
      const res = await acceptFriendRequest(requestId);
      toast.success(res);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    }
  };

  const handleDecline = async (resquestId?: string) => {
    if (!resquestId) return;
    try {
      const res = await declineFriendRequest(resquestId);
      toast.success(res);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (targetUserId: string) => {
    try {
      const res = await deleteFriend(targetUserId);
      toast.success(res);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="mb-4">Tìm bạn</CardTitle>
        <CardDescription>
          <SearchComponent
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm người dùng (username/Tên hiển thị)..."
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-74 max-h-74 overflow-y-auto beautiful-scrollbar">
        {keyword.trim() ? (
          !users.length ? (
            <div className="leading-74 text-center select-none">
              Không tìm thấy người dùng
            </div>
          ) : (
            <div className="">
              {users.map((user, index) => {
                return (
                  <div
                    key={index}
                    className="py-2 flex items-center gap-4 border-b border-secondary
                    hover:bg-secondary"
                  >
                    <UserAvatar
                      type="chat"
                      name={user.displayName}
                      avatarUrl={user.avatarUrl || null}
                    />
                    <div className="flex items-center justify-between flex-1">
                      <div>
                        <p className="textsm truncate">{user.displayName}</p>
                        <p className="text-xs">{user.userName}</p>
                      </div>

                      <AddFriendActions
                        accept={handleAccept}
                        decline={handleDecline}
                        deleteFriend={handleDelete}
                        sendRequest={handleSendRequest}
                        user={user}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <Tabs defaultValue="request-received" className="">
            <TabsList className="w-full sticky top-0 z-10">
              <TabsTrigger value="request-received">
                Yêu cầu Đã nhận
                <Badge
                  variant={'destructive'}
                  className={`${received.length < 1 && 'bg-background text-primary border-primary'}`}
                >
                  {received.length > 9 ? '9+' : received.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="request-sent">
                Yêu cầu đã gửi
                <Badge
                  variant={'destructive'}
                  className={`${sent.length < 1 && 'bg-background text-primary border-primary'}`}
                >
                  {sent.length > 9 ? '9+' : sent.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            {/* yêu cầu nhận */}
            <TabsContent
              value="request-received"
              // className="max-h-65 overflow-y-auto min-h-65"
            >
              <RequestReceived decline={handleDecline} accept={handleAccept} />
            </TabsContent>
            {/* yêu cầu gửi */}
            <TabsContent
              value="request-sent"
              // className="overflow-y-auto max-h-65 min-h-65"
            >
              <RequestSentTab cancel={handleDecline} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AddFriendTab;
