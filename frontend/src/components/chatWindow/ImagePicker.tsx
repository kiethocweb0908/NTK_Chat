import { ImagePlus, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImagePickerProps {
  mode?: 'input' | 'preview'; // 'input' cho thanh chat, 'preview' cho khu vực xem trước
}

const ImagePicker = ({ mode = 'input' }: ImagePickerProps) => {
  const { selectedImages, addImages } = useChatStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedImages.length + files.length > 5) {
      return toast.warning('Bạn chỉ được chọn tối đa 5 ảnh!');
    }
    if (files.length > 0) {
      addImages(files);
      e.target.value = '';
    }
  };
  const isPreviewMode = mode === 'preview';

  return (
    <Button
      type="button"
      variant={isPreviewMode ? 'outline' : 'ghost'}
      size="icon"
      className={cn(
        'relative transition-smooth shrink-0',
        isPreviewMode
          ? 'size-18 lg:size-20 border-dashed border-2 hover:bg-secondary/50 flex flex-col gap-1'
          : 'size-10 hover:bg-primary/10'
      )}
    >
      {isPreviewMode ? (
        <>
          <Plus className="size-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">Thêm</span>
        </>
      ) : (
        <ImagePlus className="size-4" />
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
      />
    </Button>
  );
};

export default ImagePicker;
