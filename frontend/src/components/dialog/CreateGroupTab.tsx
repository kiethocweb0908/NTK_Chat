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
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { AlertDialogAction } from '@radix-ui/react-alert-dialog';

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

const selected: any = [
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

const CreateGroupTab = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <>
      <Card className="shadow-none">
        <CardHeader>
          {/* <CardTitle className="mb-4">Tạo nhóm</CardTitle> */}
          <CardDescription className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Tên nhóm</Label>
              <Input placeholder="Tên nhóm..." />
            </div>
            <div className="flex items-center justify-between">
              <span>Đã chọn: </span>
              {selected.length && (
                <div className="flex mt-1">
                  {selected.map((s: any, index: any) => (
                    <div key={index}>
                      <UserAvatar type="chat" isGroup={true} name={s.displayName} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2">Danh sách bạn bè</Label>
              <SearchComponent />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm space-y-4 overflow-y-auto max-h-65">
          {friends.map((f, index) => {
            return (
              <div
                key={index}
                className="flex items-center gap-4 py-2
            hover:bg-secondary"
              >
                <Checkbox />
                <UserAvatar type="chat" name={f.displayName} avatarUrl={f.avatarUrl} />
                <div className="flex items-center justify-between flex-1">
                  <p>{f.displayName}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
        {/* <AlertDialogAction className="bg-primary">Tạo nhóm</AlertDialogAction> */}
      </Card>

      <Button variant={'outline'} className="w-full py-4 mt-4">
        Tạo nhóm
      </Button>
    </>
  );
};

export default CreateGroupTab;
