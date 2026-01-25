import type { ISearchUserResponse } from '@/types/friend';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useFriendStore } from '@/stores/useFriendStore';

interface IAddFriendActions {
  user: ISearchUserResponse;
  sendRequest: (to: string) => void;
  decline: (requestId: string | undefined) => void;
  deleteFriend: (targetUserId: string) => void;
  accept: (requestId: string | undefined) => void;
}
const AddFriendActions = ({
  user,
  sendRequest,
  deleteFriend,
  decline,
  accept,
}: IAddFriendActions) => {
  const loading = useFriendStore((s) => s.loading);

  // Sử dụng switch case hoặc mapping để render cho gọn
  switch (user.relationship) {
    case 'friend':
      return (
        <div className="flex gap-2">
          <Button
            onClick={() => deleteFriend(user._id)}
            disabled={loading}
            variant={'dangerGhost'}
            size="sm"
          >
            Xoá bạn
          </Button>
          <Badge variant={'friend'}>Bạn bè</Badge>
        </div>
      );
    case 'sent':
      return (
        <Button
          onClick={() => decline(user.requestId)}
          disabled={loading}
          variant={'dangerGhost'}
          size="sm"
        >
          Huỷ yêu cầu
        </Button>
      );
    case 'received':
      return (
        <div className="flex gap-2">
          <Button
            onClick={() => decline(user.requestId)}
            disabled={loading}
            variant={'dangerGhost'}
            size="sm"
          >
            Từ chối
          </Button>
          <Button
            onClick={() => accept(user.requestId)}
            disabled={loading}
            variant={'sent'}
            size="sm"
          >
            Chấp nhận
          </Button>
        </div>
      );
    default: // Trường hợp 'none'
      return (
        <Button
          size="sm"
          variant={'sent'}
          onClick={() => sendRequest(user._id)}
          disabled={loading}
        >
          Gửi lời mời
        </Button>
      );
  }
};

export default AddFriendActions;
