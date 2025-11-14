import { useState } from "react";
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
      noPadding={true}
    >
      <div className="p-6">
        <div className="mb-4">
          <label
            htmlFor="workspace-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Workspace Name
          </label>
          <input
            id="workspace-name"
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter workspace name..."
            autoFocus
          />
          <p className="mt-2 text-xs text-gray-500">
            Give your workspace a meaningful name to help identify it later.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!workspaceName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
