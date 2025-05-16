
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  resetSearch 
}) => {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex items-center bg-white p-2 rounded-md shadow-sm">
        <Search className="h-4 w-4 text-gray-500 mr-2" />
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={onSearchChange}
          className="h-8 w-[200px] border-none focus-visible:ring-0"
        />
        {searchTerm && (
          <button className="h-8 w-8 p-0 ml-1" onClick={resetSearch}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
