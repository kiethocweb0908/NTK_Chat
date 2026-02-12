import { cn } from '@/lib/utils';

const MessageImageGrid = ({
  images,
}: {
  images: { imgUrl?: string; imgId?: string }[];
}) => {
  if (!images || images.length === 0) return null;

  const count = images.length;

  return (
    <div
      className={cn(
        'grid gap-1 mt-2 mb-1 overflow-hidden rounded-lg',
        count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-2' : 'grid-cols-2'
      )}
    >
      {images.map((img, index) => (
        <div
          key={img.imgId}
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
  );
};

export default MessageImageGrid;
