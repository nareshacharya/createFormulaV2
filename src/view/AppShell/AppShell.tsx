
import { useState } from 'react';
import AppHeader from './AppHeader';
import LibraryPanel from '../Library/LibraryPanel';
import WorkArea from '../WorkArea/WorkArea';

const AppShell = () => {
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <AppHeader />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Library Panel */}
        <div 
          className={`
            ${isLibraryCollapsed ? 'w-12' : 'w-96'} 
            flex-shrink-0 transition-all duration-300 ease-in-out
            border-r border-gray-200 bg-white relative z-1
          `}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
            className="absolute top-4 -right-3 z-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <i className={`ri-arrow-${isLibraryCollapsed ? 'right' : 'left'}-s-line text-sm`}></i>
          </button>
          
          {/* Library Content */}
          <div className={`h-full ${isLibraryCollapsed ? 'hidden' : 'block'}`}>
            <LibraryPanel />
          </div>
          
          {/* Collapsed State */}
          {isLibraryCollapsed && (
            <div className="h-full flex flex-col items-center py-4 space-y-4">
              <div className="text-gray-400 text-xs font-medium transform -rotate-90 whitespace-nowrap">
                Library
              </div>
            </div>
          )}
        </div>
        
        {/* Work Area */}
        <div className="flex-1 overflow-hidden z-0">
          <WorkArea />
        </div>
      </div>
    </div>
  );
};

export default AppShell;
