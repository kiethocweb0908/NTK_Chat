import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const SearchComponent = () => {
  return (
    <div
      className="relative w-full flex-1
      group-data-[state=collapsed]:hidden"
    >
      <Input className="pl-8 bg-white" placeholder="Tìm kiếm đoạn chat..." />
      <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 left-2" />
    </div>
  );
};

export default SearchComponent;
