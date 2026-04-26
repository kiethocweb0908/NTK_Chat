import { cn } from '@/lib/utils';
import { useState } from 'react';
import ChatLightbox from '../common/ChatLightbox';

const MessageImageGrid = ({
  images,
}: {
  images: { imgUrl?: string; imgId?: string }[];
}) => {
  if (!images || images.length === 0) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = images
    .filter((img) => img.imgUrl) // Bỏ qua nếu lỡ có ảnh lỗi không có url
    .map((img) => ({
      src: img.imgUrl!, // Dùng dấu ! vì ta đã filter ở trên
    }));

  const count = images.length;

  return (
    <>
      <div
        className={cn(
          'grid gap-1 mt-2 mb-1 overflow-hidden rounded-lg',
          count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : 'grid-cols-2'
        )}
      >
        {images.map((img, index) => (
          <div
            key={img.imgId}
            onClick={() => {
              // 5. Khi click: Lưu vị trí ảnh và mở Lightbox
              setCurrentIndex(index);
              setIsOpen(true);
            }}
            className={cn(
              'relative cursor-pointer hover:opacity-90 transition-opacity bg-muted',
              // Nếu có 3 ảnh, ảnh đầu tiên cho chiếm full chiều ngang hàng trên
              count === 3 && index === 0 ? 'col-span-2 h-48' : 'h-32',
              count === 1 ? 'h-auto max-h-80' : ''
            )}
          >
            <img
              src={img.imgUrl}
              alt="Message content"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <ChatLightbox
        open={isOpen}
        index={currentIndex}
        close={() => setIsOpen(false)}
        slides={slides}
      />
    </>
  );
};

export default MessageImageGrid;
