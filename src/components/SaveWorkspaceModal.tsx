import { useState } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Modal from "./Modal";

interface SaveWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

const SaveWorkspaceModal = ({
  isOpen,
  onClose,
  onSave,
  defaultName = "",
}: SaveWorkspaceModalProps) => {
  const [workspaceName, setWorkspaceName] = useState(
    defaultName || `Workspace ${new Date().toLocaleString()}`
  );

  const handleSave = () => {
    if (workspaceName.trim()) {
      onSave(workspaceName.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Workspace"
      noPadding
    >
      <div style={tw("p-6")}>
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="workspace-name"
            style={tw("block text-sm font-medium text-gray-700")}
          >
            Workspace Name
          </label>
          <input
            id="workspace-name"
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={tw("w-full px-3 py-2 border border-gray-300 rounded-lg")}
            placeholder="Enter workspace name..."
          />
          <p style={tw("mt-2 text-xs text-gray-500")}>
            Give your workspace a meaningful name to help identify it later.
          </p>
        </div>

        <div style={tw("flex justify-end gap-2 mt-6")}>
          <button
                type="button"
            onClick={onClose}
            style={tw(
              "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg"
            )}
          >
            Cancel
          </button>
          <button
                type="button"
            onClick={handleSave}
            disabled={!workspaceName.trim()}
            style={mergeStyles(
              tw(
                "px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg flex items-center"
              ),
              {
                gap: "0.5rem",
                opacity: !workspaceName.trim() ? 0.5 : 1,
                cursor: !workspaceName.trim() ? "not-allowed" : "pointer",
              }
            )}
          >
            <i className="ri-save-line"></i>
            Save Workspace
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveWorkspaceModal;
