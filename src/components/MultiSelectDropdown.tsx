
import { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
}

const MultiSelectDropdown = ({
  options,
  selectedOptions,
  onSelectionChange,
  placeholder = "Select columns...",
  maxHeight = "200px"
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter(item => item !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...options]);
    }
  };

  const formatLabel = (option: string) => {
    return option.replace(/([A-Z])/g, ' $1').trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {selectedOptions.length === 0 
              ? placeholder 
              : `${selectedOptions.length} column${selectedOptions.length !== 1 ? 's' : ''} selected`
            }
          </span>
          <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-gray-400`}></i>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Select All Option */}
          <div className="p-2 border-b border-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium">
              <input
                type="checkbox"
                checked={selectedOptions.length === options.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700">Select All</span>
            </label>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map(option => (
              <label
                key={option}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-600">{formatLabel(option)}</span>
              </label>
            ))}
            
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No columns found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
