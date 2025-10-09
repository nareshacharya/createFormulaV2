
import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  debounceMs?: number;
  className?: string;
}

const SearchBar = ({ 
  placeholder = 'Search...', 
  value: externalValue,
  onChange: externalOnChange,
  onSearch, 
  onFilterClick,
  showFilterButton = false,
  debounceMs = 300,
  className = ''
}: SearchBarProps) => {
  const [internalQuery, setInternalQuery] = useState('');
  const query = externalValue !== undefined ? externalValue : internalQuery;
  const setQuery = externalOnChange || setInternalQuery;

  useEffect(() => {
    if (onSearch) {
      const timer = setTimeout(() => {
        onSearch(query);
      }, debounceMs);

      return () => clearTimeout(timer);
    }
  }, [query, onSearch, debounceMs]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className="ri-search-line text-gray-400 text-sm"></i>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full pl-10 py-2 text-sm border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder-gray-500
          ${showFilterButton ? 'pr-10' : 'pr-4'}
        `}
      />
      {showFilterButton && (
        <button
          onClick={onFilterClick}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-md transition-colors cursor-pointer"
          aria-label="Open advanced filters"
          title="Advanced filters"
        >
          <i className="ri-equalizer-line text-gray-400 text-sm hover:text-gray-600"></i>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
