import { useState, useEffect, useRef } from "react";
import type { SavedView } from "../types";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  // Saved views props
  enableSavedViews?: boolean;
  savedViews?: SavedView[];
  currentViewId?: string | null;
  onSaveView?: (viewName: string) => void;
  onLoadView?: (viewId: string) => void;
  onDeleteView?: (viewId: string) => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  onBulkDelete,
  onClearSelection,
  enableSavedViews = false,
  savedViews = [],
  currentViewId = null,
  onSaveView,
  onLoadView,
  onDeleteView,
}: BulkActionsToolbarProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewName, setViewName] = useState("");
  const [showViewsList, setShowViewsList] = useState(false);

  const saveDialogRef = useRef<HTMLDivElement>(null);
  const viewsListRef = useRef<HTMLDivElement>(null);

  const handleSaveView = () => {
    if (viewName.trim() && onSaveView) {
      onSaveView(viewName.trim());
      setViewName("");
      setShowSaveDialog(false);
    }
  };

  // Handle click outside for save dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveDialogRef.current &&
        !saveDialogRef.current.contains(event.target as Node)
      ) {
        setShowSaveDialog(false);
        setViewName("");
      }
    };

    if (showSaveDialog) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSaveDialog]);

  // Handle click outside for views list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        viewsListRef.current &&
        !viewsListRef.current.contains(event.target as Node)
      ) {
        setShowViewsList(false);
      }
    };

    if (showViewsList) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showViewsList]);

  return (
    <div className="flex items-center justify-between mb-3 px-6 py-2.5 bg-gray-50/50">
      {/* Left side - Bulk actions */}
      <div className="flex items-center space-x-3 text-xs">
        <span className="text-gray-600 font-medium">
          {selectedCount} selected
        </span>

        {selectedCount > 0 && (
          <>
            <button
              onClick={onClearSelection}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear
            </button>

            {onBulkDelete && (
              <button
                onClick={onBulkDelete}
                className="text-red-600 hover:text-red-700 transition-colors flex items-center space-x-1"
              >
                <i className="ri-delete-bin-line"></i>
                <span>Delete</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Right side - Saved views */}
      {enableSavedViews && (
        <div className="flex items-center space-x-2 text-xs">
          {/* Save View Button */}
          <div className="relative" ref={saveDialogRef}>
            <button
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <i className="ri-save-line"></i>
              <span>Save View</span>
            </button>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-30 min-w-[250px]">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    View Name
                  </label>
                  <input
                    type="text"
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="Enter view name..."
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveView();
                      } else if (e.key === "Escape") {
                        setShowSaveDialog(false);
                        setViewName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveView}
                      disabled={!viewName.trim()}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setViewName("");
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Views List Button */}
          <div className="relative" ref={viewsListRef}>
            <button
              onClick={() => setShowViewsList(!showViewsList)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <i className="ri-folder-line"></i>
              <span>Views ({savedViews.length})</span>
            </button>

            {/* Views List */}
            {showViewsList && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 z-30 min-w-[300px] max-h-[400px] overflow-y-auto">
                {savedViews.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500 text-center">
                    No saved views yet
                  </div>
                ) : (
                  <div>
                    {savedViews.map((view) => (
                      <div
                        key={view.id}
                        className={`px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                          currentViewId === view.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div
                          className="flex-1"
                          onClick={() => {
                            onLoadView?.(view.id);
                            setShowViewsList(false);
                          }}
                        >
                          <div className="text-xs font-medium text-gray-900">
                            {view.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(view.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete view "${view.name}"?`)) {
                              console.log("Deleting view:", view.id);
                              onDeleteView?.(view.id);
                            }
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                          title="Delete view"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
