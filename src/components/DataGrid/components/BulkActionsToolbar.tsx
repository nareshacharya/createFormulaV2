import { useState } from "react";
import Button from "../../Button";
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

  const handleSaveView = () => {
    if (viewName.trim() && onSaveView) {
      onSaveView(viewName.trim());
      setViewName("");
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
      {/* Left side - Bulk actions */}
      <div className="flex items-center space-x-2">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm text-gray-700 font-medium">
              {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={onBulkDelete}
              className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
            >
              <i className="ri-delete-bin-line text-sm"></i>
              <span>Delete</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearSelection}
              className="flex items-center space-x-1"
            >
              <i className="ri-close-line text-sm"></i>
              <span>Clear</span>
            </Button>
          </>
        ) : (
          <span className="text-sm text-gray-500">No rows selected</span>
        )}
      </div>

      {/* Right side - Saved views */}
      {enableSavedViews && (
        <div className="flex items-center space-x-2">
          {/* Save View Button */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              className="flex items-center space-x-1"
            >
              <i className="ri-save-line text-sm"></i>
              <span>Save View</span>
            </Button>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-30 min-w-[250px]">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    View Name
                  </label>
                  <input
                    type="text"
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="Enter view name..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveView}
                      disabled={!viewName.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setViewName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Views List Button */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowViewsList(!showViewsList)}
              className="flex items-center space-x-1"
            >
              <i className="ri-folder-line text-sm"></i>
              <span>Views ({savedViews.length})</span>
            </Button>

            {/* Views List */}
            {showViewsList && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-30 min-w-[300px] max-h-[400px] overflow-y-auto">
                {savedViews.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No saved views yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {savedViews.map((view) => (
                      <div
                        key={view.id}
                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
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
                          <div className="text-sm font-medium text-gray-900">
                            {view.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(view.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                `Delete view "${view.name}"?`
                              )
                            ) {
                              onDeleteView?.(view.id);
                            }
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
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
