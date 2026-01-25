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

const friends = [
  {
    _id: '1',
    displayName: 'Nguyễn Văn A',
    avatarUrl: null,
  },
  {
    _id: '2',
    displayName: 'Lê Văn B',
    avatarUrl: null,
  },
  {
    _id: '3',
    displayName: 'C',
    avatarUrl: null,
  },
  {
    _id: '3',
    displayName: 'C',
    avatarUrl: null,
  },
  {
    _id: '3',
    displayName: 'C',
    avatarUrl: null,
  },
  {
    _id: '3',
    displayName: 'C',
    avatarUrl: null,
  },
  {
    _id: '3',
    displayName: 'C',
    avatarUrl: null,
  },
];

const Friends = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="mb-4">Danh sách bạn bè</CardTitle>
        <CardDescription>
          <SearchComponent />
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm overflow-y-auto max-h-65">
        {friends.map((f, index) => {
          return (
            <div
              key={index}
              className="flex items-center gap-4 py-2
            hover:bg-secondary"
            >
              <UserAvatar type="chat" name={f.displayName} avatarUrl={f.avatarUrl} />
              <div className="flex items-center justify-between flex-1">
                <p>{f.displayName}</p>
                <Button variant={null} className="bg-sent text-secondary">
                  Nhắn tin
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Friends;
