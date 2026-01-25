import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface ISearchComponent {
  value: string;
  onChange: (e: any) => void;
  placeholder: string;
}

const SearchComponent = ({ value, onChange, placeholder }: ISearchComponent) => {
  return (
    <div
      className="relative w-full flex-1
      group-data-[state=collapsed]:hidden"
    >
      <Input
        value={value}
        onChange={onChange}
        className="pl-8 bg-white"
        placeholder={placeholder}
      />
      <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 left-2" />
    </div>
  );
};

export default SearchComponent;
