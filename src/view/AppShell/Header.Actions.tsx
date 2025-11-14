import { useEffect } from "react";
import toast from "react-hot-toast";
import { useModal } from "../../App";
import SaveWorkspaceModal from "../../components/SaveWorkspaceModal";
import { eventBus } from "../../utils/bus";
import {
  saveWorkspace,
  canCreateWorkspace,
  type WorkspaceState,
} from "../../utils/workspaceManager";
import { tw, mergeStyles } from "../../utils/tailwindToInline";

const HeaderActions = () => {
  const { showModal, hideModal } = useModal();

  useEffect(() => {
    // No event listeners needed - all actions are now in BulkActionsToolbar
  }, []);

  const handleSaveWorkspace = () => {
    if (!canCreateWorkspace()) {
      toast.error(
        "Maximum of 3 workspaces allowed. Please delete one to create new."
      );
      return;
    }

    showModal(
      <SaveWorkspaceModal
        isOpen={true}
        onClose={hideModal}
        onSave={handleSaveWorkspaceWithName}
      />
    );
  };

  const handleSaveWorkspaceWithName = (workspaceName: string) => {
    try {
      // Set up one-time listener for workspace state
      const handleWorkspaceStateReady = ({
        state,
      }: {
        state: WorkspaceState;
      }) => {
        try {
          const workspace = saveWorkspace(workspaceName, state);
          toast.success(`Workspace "${workspace.name}" saved successfully!`);
          hideModal();

          // Clean up listener
          eventBus.off("workspace-state-ready", handleWorkspaceStateReady);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to save workspace"
          );
          eventBus.off("workspace-state-ready", handleWorkspaceStateReady);
        }
      };

      // Register listener
      eventBus.on("workspace-state-ready", handleWorkspaceStateReady);

      // Request current state from WorkArea
      eventBus.emit("request-workspace-state");

      // Set a timeout in case WorkArea doesn't respond
      setTimeout(() => {
        eventBus.off("workspace-state-ready", handleWorkspaceStateReady);
      }, 5000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save workspace"
      );
    }
  };

  return (
    <div style={mergeStyles(tw("flex items-center"), { gap: "0.75rem" })}>
      {/* Save Workspace Button Only */}
      <button
        onClick={handleSaveWorkspace}
        style={mergeStyles(
          tw(
            "group relative flex flex-col items-center justify-center py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
          ),
          { width: "52px" }
        )}
        title="Save current workspace state"
      >
        <span
          style={mergeStyles(tw("text-2xl"), { lineHeight: "1.5rem" })}
          className="material-symbols-rounded"
        >
          save
        </span>
        <span style={tw("text-[10px] font-medium hidden xl:inline")}>Save</span>
        {/* Tooltip for small screens */}
        <div
          style={mergeStyles(
            tw(
              "absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none xl:hidden"
            ),
            { marginBottom: "0.5rem" }
          )}
        >
          Save
        </div>
      </button>
    </div>
  );
};

export default HeaderActions;
