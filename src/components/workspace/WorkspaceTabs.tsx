import { useState, useRef, useEffect } from "react";
import { useWorkspaceFeatures } from "../../hooks/useFeatureFlags";
import { useWorkspace } from "../../hooks/useWorkspace";

/**
 * Workspace tabs component for managing multiple workspace sessions
 * Allows users to have multiple workspace tabs with rename and close capabilities
 * Each tab maintains its own isolated session state
 *
 * Tab limit configured via feature flag: workspace.maxWorkspaces
 */
const WorkspaceTabs = () => {
  const { tabs, activeTabId, addTab, closeTab, switchTab, renameTab } =
    useWorkspace();
  const { maxWorkspaces } = useWorkspaceFeatures();

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleRenameTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setEditingTabId(tabId);
      setEditingName(tab.name);
    }
  };

  const handleSaveRename = () => {
    if (!editingTabId || !editingName.trim()) {
      setEditingTabId(null);
      return;
    }

    renameTab(editingTabId, editingName);
    setEditingTabId(null);
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative flex items-center gap-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="relative">
          {editingTabId === tab.id ? (
            <div className="flex items-center px-4 py-2 bg-purple-50 border-l-3 border-purple-500">
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                className="min-w-[100px] px-2 text-sm font-medium text-purple-800 bg-transparent border-b border-purple-400 outline-none"
                maxLength={20}
              />
            </div>
          ) : (
            <button
              onClick={() => switchTab(tab.id)}
              onDoubleClick={() => handleRenameTab(tab.id)}
              className={`group relative px-4 py-2 min-w-[120px] text-left font-medium transition-all text-sm ${
                activeTabId === tab.id
                  ? "bg-purple-100 text-purple-800 border-l-3 border-purple-600"
                  : "bg-transparent text-gray-600 hover:bg-gray-50 border-l-3 border-transparent"
              }`}
              title={`Last modified: ${formatTime(tab.lastModified)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <i
                    className={`ri-folder-3-line ${
                      activeTabId === tab.id
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  ></i>
                  <span>{tab.name}</span>
                </div>
                {!tab.isDefault && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    title="Close workspace"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </div>
            </button>
          )}
        </div>
      ))}

      {/* More Options Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          title="Workspace options"
        >
          <i className="ri-more-fill text-gray-500"></i>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-50">
            <button
              onClick={() => {
                addTab();
                setShowMenu(false);
              }}
              disabled={tabs.length >= maxWorkspaces}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i className="ri-add-line"></i>
              Add Workspace ({tabs.length}/{maxWorkspaces})
            </button>
            <button
              onClick={() => {
                const tab = tabs.find((t) => t.id === activeTabId);
                if (tab) {
                  handleRenameTab(activeTabId);
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <i className="ri-edit-line"></i>
              Rename Active
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceTabs;
