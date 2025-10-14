import { useState, useEffect, useRef, useCallback } from "react";
import {
  getWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  deleteWorkspace,
  renameWorkspace,
  type Workspace,
} from "../utils/workspaceManager";
import toast from "react-hot-toast";
import { eventBus } from "../utils/bus";

interface WorkspaceSelectorProps {
  onWorkspaceChange: (workspace: Workspace | null) => void;
  onSaveWorkspace: () => void;
}

const WorkspaceSelector = ({
  onWorkspaceChange,
  onSaveWorkspace,
}: WorkspaceSelectorProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<
    string | null
  >(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadWorkspaces = useCallback(() => {
    const ws = getWorkspaces();
    const activeId = getActiveWorkspaceId();
    setWorkspaces(ws);
    setActiveWorkspaceIdState(activeId);

    // Trigger onWorkspaceChange with the active workspace on load
    if (activeId) {
      const activeWorkspace = ws.find((w) => w.id === activeId);
      if (activeWorkspace) {
        onWorkspaceChange(activeWorkspace);
      }
    }
  }, [onWorkspaceChange]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setEditingId(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceId(workspace.id);
    setActiveWorkspaceIdState(workspace.id);

    // Emit reset-workspace event to clear canvas
    eventBus.emit("reset-workspace", {
      workspaceId: workspace.id,
      resetCanvas: true,
    });

    onWorkspaceChange(workspace);
    setIsOpen(false);
    toast.success(`Switched to workspace: ${workspace.name}`);
  };

  const handleDeleteWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (workspaces.length === 1) {
      toast.error("Cannot delete the last workspace");
      return;
    }

    if (window.confirm("Are you sure you want to delete this workspace?")) {
      deleteWorkspace(id);

      // If deleted workspace was active, switch to first remaining workspace
      if (id === activeWorkspaceId) {
        const remaining = workspaces.filter((w) => w.id !== id);
        if (remaining.length > 0) {
          handleSelectWorkspace(remaining[0]);
        } else {
          setActiveWorkspaceId(null);
          setActiveWorkspaceIdState(null);
          onWorkspaceChange(null);
        }
      }

      loadWorkspaces();
      toast.success("Workspace deleted");
    }
  };

  const handleRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      setEditingId(id);
      setEditingName(workspace.name);
    }
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      renameWorkspace(id, editingName.trim());
      loadWorkspaces();
      toast.success("Workspace renamed");
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveRename(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Workspace Tabs */}
      <div className="flex items-center gap-1">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => handleSelectWorkspace(workspace)}
            className={`px-3 py-1.5 text-sm font-medium rounded-t-lg transition-all ${
              workspace.id === activeWorkspaceId
                ? "bg-white text-purple-800"
                : "bg-purple-700 text-white hover:bg-purple-600"
            }`}
            title={`Last modified: ${new Date(
              workspace.lastModified
            ).toLocaleString()}`}
          >
            {workspace.name}
          </button>
        ))}

        {/* Dropdown toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-700 hover:bg-purple-600 transition-colors"
          title="Workspace options"
        >
          <i
            className={`ri-${
              isOpen ? "close" : "more"
            }-fill text-white text-sm`}
          ></i>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Workspaces</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {workspaces.length} / 3 workspaces
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className={`px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${
                  workspace.id === activeWorkspaceId ? "bg-purple-50" : ""
                }`}
                onClick={() => !editingId && handleSelectWorkspace(workspace)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingId === workspace.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, workspace.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {workspace.name}
                          </span>
                          {workspace.id === activeWorkspaceId && (
                            <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Modified:{" "}
                          {new Date(
                            workspace.lastModified
                          ).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    {editingId === workspace.id ? (
                      <>
                        <button
                          onClick={() => handleSaveRename(workspace.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Save"
                        >
                          <i className="ri-check-line text-green-600 text-sm"></i>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Cancel"
                        >
                          <i className="ri-close-line text-gray-600 text-sm"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleRename(workspace.id, e)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Rename"
                        >
                          <i className="ri-edit-line text-gray-600 text-sm"></i>
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteWorkspace(workspace.id, e)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line text-red-600 text-sm"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-gray-100">
            <button
              onClick={() => {
                onSaveWorkspace();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ri-save-line"></i>
              Save Current State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
