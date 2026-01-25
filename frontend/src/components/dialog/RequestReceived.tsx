import { useFriendStore } from '@/stores/useFriendStore';
import UserAvatar from '../chat/UserAvatar';
import { Button } from '../ui/button';
import { type IReceived } from '@/types/friend';

interface IRequestReceived {
  decline: (requestId: string) => void;
  accept: (requestId: string) => void;
}

const RequestReceived = ({ decline, accept }: IRequestReceived) => {
  const received = useFriendStore((s) => s.received);
  const loading = useFriendStore((s) => s.loading);
  return (
    <>
      {received.length ? (
        received.map((r: IReceived) => {
          return (
            <div
              key={r._id}
              className="flex items-center gap-4 py-2
            hover:bg-secondary"
            >
              <UserAvatar
                type="chat"
                name={r.from.displayName}
                avatarUrl={r.from.avatarUrl}
              />
              <div className="flex items-center justify-between flex-1">
                <p>{r.from.displayName}</p>
                <div className="flex gap-2">
                  <Button
                    disabled={loading}
                    onClick={() => decline(r._id)}
                    variant={'dangerGhost'}
                  >
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => accept(r._id)}
                    disabled={loading}
                    variant={'sent'}
                  >
                    Chấp nhận
                  </Button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center leading-65">Chưa có yêu cầu kết bạn</p>
      )}
    </>
  );
};

export default RequestReceived;
