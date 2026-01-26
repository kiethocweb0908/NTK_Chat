import { useFriendStore } from '@/stores/useFriendStore';
import UserAvatar from '../chat/UserAvatar';
import { Button } from '../ui/button';

interface IRequestSentTab {
  cancel: (requestId: string) => void;
}

const RequestSentTab = ({ cancel }: IRequestSentTab) => {
  const sent = useFriendStore((s) => s.sent);
  const loading = useFriendStore((s) => s.loading);
  return (
    <>
      {sent.length ? (
        sent.map((s) => {
          return (
            <div
              key={s._id}
              className="flex items-center gap-4 py-2
            hover:bg-secondary"
            >
              <UserAvatar
                type="chat"
                name={s.to.displayName}
                avatarUrl={s.to.avatarUrl}
              />
              <div className="flex items-center justify-between flex-1">
                <p>{s.to.displayName}</p>
                <Button
                  disabled={loading}
                  onClick={() => cancel(s._id)}
                  variant={'dangerGhost'}
                  // className="bg-primary-foreground text-destructive cursor-pointer"
                >
                  Huỷ yêu cầu
                </Button>
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

export default RequestSentTab;
