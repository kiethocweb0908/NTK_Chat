import { useChatStore } from '@/stores/useChatStore';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ImagePicker from './ImagePicker';

const ImageSelectedPreview = () => {
  const selectedImages = useChatStore((s) => s.selectedImages);
  const removeImage = useChatStore((s) => s.removeImage);
  const [previews, setPreviews] = useState<string[]>([]);

  // Tạo và dọn dẹp URL tạm thời
  useEffect(() => {
    if (!selectedImages.length) {
      setPreviews([]);
      return;
    }

    const objectUrls = selectedImages.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);

    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedImages]);

  if (selectedImages.length === 0) return null;

  return (
    <div className="flex gap-3 p-3 bg-background border-t overflow-x-auto beautiful-scrollbar animate-in fade-in slide-in-from-bottom-1">
      {previews.map((url, index) => (
        <div key={url} className="relative size-18 lg:size-20 shrink-0 group">
          <img
            src={url}
            alt="preview"
            className="size-full object-cover rounded-md border border-secondary-foreground/20"
          />
          <button
            onClick={() => removeImage(index)}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
      {selectedImages.length < 5 && <ImagePicker mode="preview" />}
    </div>
  );
};

export default ImageSelectedPreview;
