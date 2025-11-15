import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { tw, mergeStyles } from "../../utils/tailwindToInline";

interface WorkspaceTab {
  id: string;
  name: string;
  lastModified: Date;
  isDefault: boolean;
}

const MAX_TABS = 3;
const DEFAULT_TAB_NAME = "Workspace 1";

/**
 * Workspace tabs component for managing multiple workspace sessions
 * Allows users to have up to 3 workspace tabs with rename and close capabilities
 */
const WorkspaceTabs = () => {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    {
      id: "default",
      name: DEFAULT_TAB_NAME,
      lastModified: new Date(),
      isDefault: true,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("default");
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

  const handleAddTab = () => {
    if (tabs.length >= MAX_TABS) {
      toast.error(`Maximum of ${MAX_TABS} tabs allowed`);
      return;
    }

    const newTab: WorkspaceTab = {
      id: `tab-${Date.now()}`,
      name: `Workspace ${tabs.length + 1}`,
      lastModified: new Date(),
      isDefault: false,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    toast.success(`New workspace "${newTab.name}" created`);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.isDefault) {
      toast.error("Cannot close the default workspace");
      return;
    }

    const updatedTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(updatedTabs);

    // If closing active tab, switch to first tab
    if (activeTabId === tabId) {
      setActiveTabId(updatedTabs[0].id);
    }

    toast.success(`Workspace "${tab?.name}" closed`);
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

    setTabs(
      tabs.map((tab) =>
        tab.id === editingTabId
          ? { ...tab, name: editingName.trim(), lastModified: new Date() }
          : tab
      )
    );

    toast.success("Workspace renamed");
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
    <div
      style={mergeStyles(tw("relative flex items-center"), { gap: "0.5rem" })}
    >
      {tabs.map((tab) => (
        <div key={tab.id} style={tw("relative")}>
          {editingTabId === tab.id ? (
            <div
              style={tw(
                "flex items-center px-4 py-2 bg-purple-50 border-l-3 border-purple-500"
              )}
            >
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                style={mergeStyles(
                  tw(
                    "px-2 text-sm font-medium text-purple-800 bg-transparent border-b border-purple-400 outline-none"
                  ),
                  { minWidth: "100px" }
                )}
                maxLength={20}
              />
            </div>
          ) : (
            <button
                  type="button"
              onClick={() => setActiveTabId(tab.id)}
              onDoubleClick={() => handleRenameTab(tab.id)}
              style={mergeStyles(
                tw(
                  "group relative px-4 py-2 text-left font-medium transition-all text-sm border-l-3"
                ),
                { minWidth: "120px" },
                activeTabId === tab.id
                  ? tw("bg-purple-100 text-purple-800 border-purple-600")
                  : tw(
                      "bg-transparent text-gray-600 hover:bg-gray-50 border-transparent"
                    )
              )}
              title={`Last modified: ${formatTime(tab.lastModified)}`}
            >
              <div
                style={mergeStyles(tw("flex items-center justify-between"), {
                  gap: "0.75rem",
                })}
              >
                <div
                  style={mergeStyles(tw("flex items-center"), {
                    gap: "0.5rem",
                  })}
                >
                  <span
                    style={tw(
                      activeTabId === tab.id
                        ? "text-purple-600"
                        : "text-gray-400"
                    )}
                    className="material-symbols-rounded"
                  >
                    folder
                  </span>
                  <span>{tab.name}</span>
                </div>
                {!tab.isDefault && (
                  <button
                  type="button"
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    style={tw(
                      "opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    )}
                    title="Close workspace"
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                )}
              </div>
            </button>
          )}
        </div>
      ))}

      {/* More Options Button */}
      <div style={tw("relative")} ref={menuRef}>
        <button
                  type="button"
          onClick={() => setShowMenu(!showMenu)}
          style={mergeStyles(
            tw(
              "flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            ),
            { width: "2rem", height: "2rem" }
          )}
          title="Workspace options"
        >
          <span
            style={tw("text-gray-500")}
            className="material-symbols-rounded"
          >
            more_vert
          </span>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            style={mergeStyles(
              tw(
                "absolute top-full right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
              ),
              { marginTop: "0.5rem", minWidth: "180px" }
            )}
          >
            <button
                  type="button"
              onClick={() => {
                handleAddTab();
                setShowMenu(false);
              }}
              disabled={tabs.length >= MAX_TABS}
              style={mergeStyles(
                tw(
                  "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                ),
                { gap: "0.5rem" }
              )}
            >
              <span className="material-symbols-rounded">add</span>
              Add Workspace ({tabs.length}/{MAX_TABS})
            </button>
            <button
                  type="button"
              onClick={() => {
                const tab = tabs.find((t) => t.id === activeTabId);
                if (tab) {
                  handleRenameTab(activeTabId);
                }
                setShowMenu(false);
              }}
              style={mergeStyles(
                tw(
                  "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                ),
                { gap: "0.5rem" }
              )}
            >
              <span className="material-symbols-rounded">edit</span>
              Rename Active
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceTabs;
