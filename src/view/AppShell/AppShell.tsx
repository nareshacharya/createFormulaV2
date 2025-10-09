import { useState } from "react";
import AppHeader from "./AppHeader";
import LibraryPanel from "../Library/LibraryPanel";
import WorkArea from "../WorkArea/WorkArea";

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
            ${isLibraryCollapsed ? "w-12" : "w-96"} 
            flex-shrink-0 transition-all duration-300 ease-in-out
            bg-white relative
          `}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
            className="absolute top-4 -right-4 z-[99] w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-md transition-colors"
            aria-label={
              isLibraryCollapsed ? "Expand Library" : "Collapse Library"
            }
          >
            <i
              className={`ri-arrow-${
                isLibraryCollapsed ? "right" : "left"
              }-s-line text-base`}
            ></i>
          </button>{" "}
          {/* Library Content */}
          <div
            className={`h-full ${
              isLibraryCollapsed ? "hidden" : "block"
            } border-r border-gray-200`}
          >
            <LibraryPanel />
          </div>
          {/* Collapsed State */}
          {isLibraryCollapsed && (
            <div className="h-full flex flex-col items-center justify-start pt-16 border-r border-gray-200">
              <div className="font-medium text-sm uppercase tracking-wider text-blue-700 transform -rotate-90 whitespace-nowrap">
                Library
              </div>
            </div>
          )}
        </div>

        {/* Work Area */}
        <div className="flex-1 overflow-hidden">
          <WorkArea />
        </div>
      </div>
    </div>
  );
};

export default AppShell;
