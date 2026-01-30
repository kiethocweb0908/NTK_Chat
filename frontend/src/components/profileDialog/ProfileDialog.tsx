import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProfileCard from './ProfileCard';
import { Button } from '../ui/button';
import { useUserStore } from '@/stores/useUserStore';
import { toast } from 'sonner';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const ProfileDialog = ({ open, onOpenChange }: ProfileDialogProps) => {
  const updateProfile = useUserStore((s) => s.updateProfile);
  const clearImageFile = useUserStore((s) => s.clearImageFile);
  const isUpdating = useUserStore((s) => s.isUpdating);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      clearImageFile();
    }
  };

  const handleUpdate = async () => {
    const profileData = {};
    toast.promise(updateProfile(profileData), {
      loading: 'Đang cập nhật hồ sơ...',
      success: (data) => {
        return data;
      },
      error: (err) => {
        return err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          {/* Tiêu đề và mô tả của dialog */}
          <DialogTitle className="text-2xl font-bold text-foreground">
            Hồ sơ & Cài đặt
          </DialogTitle>
          <DialogDescription></DialogDescription>
          {/* ======================== */}
          {/* ======================== */}
        </DialogHeader>
        <ProfileCard />
        <Button disabled={isUpdating} variant={'sent'} onClick={handleUpdate}>
          Lưu
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
