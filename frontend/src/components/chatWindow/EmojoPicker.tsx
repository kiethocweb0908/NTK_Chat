import { useThemeStore } from '@/stores/useThemeStore';
import { Popover, PopoverContent } from '../ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface IEmojoPickerProps {
  onChange: (value: string) => void;
}

const EmojoPicker = ({ onChange }: IEmojoPickerProps) => {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer p-1.5">
        <Smile className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        side="right"
        sideOffset={45}
        className="bg-transparent border-none shadow-none mb-20"
      >
        <Picker
          theme={isDark ? 'dark' : 'light'}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          emojiSize={24}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojoPicker;
