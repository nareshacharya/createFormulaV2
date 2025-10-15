import { useState } from "react";
import Button from "../../Button";
import Modal from "../../Modal";
import type { SavedView } from "../types";

interface ViewManagerProps {
  savedViews: SavedView[];
  currentViewId: string | null;
  onSaveView: (viewName: string) => void;
  onLoadView: (viewId: string) => void;
  onDeleteView: (viewId: string) => void;
}

/**
 * Component for managing saved views (row orders)
 */
export const ViewManager = ({
  savedViews,
  currentViewId,
  onSaveView,
  onLoadView,
  onDeleteView,
}: ViewManagerProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showViewList, setShowViewList] = useState(false);
  const [viewName, setViewName] = useState("");

  const handleSave = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim());
      setViewName("");
      setShowSaveDialog(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowSaveDialog(true)}
        title="Save current row order"
      >
        <i className="ri-save-line mr-1"></i>
        Save View
      </Button>

      {savedViews.length > 0 && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowViewList(true)}
          title="Load saved views"
        >
          <i className="ri-list-check mr-1"></i>
          Views ({savedViews.length})
        </Button>
      )}

      {/* Save View Dialog */}
      <Modal
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          setViewName("");
        }}
        title="Save Current View"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Name
            </label>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="e.g., Alphabetical Order"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSaveDialog(false);
                setViewName("");
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!viewName.trim()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* View List Dialog */}
      <Modal
        isOpen={showViewList}
        onClose={() => setShowViewList(false)}
        title="Saved Views"
      >
        <div className="space-y-2">
          {savedViews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No saved views</p>
          ) : (
            savedViews.map((view) => (
              <div
                key={view.id}
                className={`flex items-center justify-between p-3 rounded border ${
                  currentViewId === view.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{view.name}</div>
                  <div className="text-sm text-gray-500">
                    Saved: {formatDate(view.timestamp)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentViewId !== view.id && (
                    <button
                      onClick={() => {
                        onLoadView(view.id);
                        setShowViewList(false);
                      }}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Load
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete "${view.name}"?`
                        )
                      ) {
                        onDeleteView(view.id);
                      }
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
