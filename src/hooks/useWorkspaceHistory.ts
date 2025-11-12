import { useWorkspace } from "./useWorkspace";
import type { StateHistoryManager } from "../utils/stateHistory";

/**
 * Custom hook to access the active workspace's undo/redo history
 * Returns the StateHistoryManager instance specific to the current workspace
 * 
 * Usage:
 * const workspaceHistory = useWorkspaceHistory();
 * workspaceHistory.push(state, 'action', 'description');
 * const previousState = workspaceHistory.undo();
 */
export const useWorkspaceHistory = (): StateHistoryManager => {
    const workspace = useWorkspace();
    return workspace.getActiveWorkspaceHistory();
};
