import { useCallback, useRef, useEffect, useState } from "react";
import { eventBus } from "../../../utils/bus";
import type { StateHistoryManager } from "../../../utils/stateHistory";
import type { UseDilutionReturn } from "../../../components/dilution";
import type { Column } from "../../../components/DataGrid";
import type { Formula } from "../../../services/pega";

interface UndoState {
    canUndo: boolean;
    undoCount: number;
}

export const useUndoStateManagement = (
    workspaceHistory: StateHistoryManager,
    workspaceActiveTabId: string,
    columns: Column[],
    tableData: Record<string, unknown>[],
    formulas: Formula[],
    availableFormulas: Formula[],
    dilutionState: UseDilutionReturn
) => {
    const [undoState, setUndoState] = useState<UndoState>({
        canUndo: false,
        undoCount: 0,
    });

    const initialStateSaved = useRef(false);
    const pendingStateSaveRef = useRef<{
        action: string;
        description: string;
    } | null>(null);

    // Helper function to save initial state before first user action
    const ensureInitialStateSaved = useCallback(() => {
        if (!initialStateSaved.current && columns.length > 0) {
            workspaceHistory.push(
                {
                    columns,
                    tableData,
                    formulas,
                    availableFormulas,
                    dilutions: dilutionState.dilutions,
                },
                "initial_state",
                "Initial application state"
            );
            initialStateSaved.current = true;
            eventBus.emit("undo-state-updated", {
                canUndo: workspaceHistory.canUndo(),
                count: workspaceHistory.getUndoCount(),
            });
        }
    }, [
        columns,
        tableData,
        formulas,
        availableFormulas,
        dilutionState,
        workspaceHistory,
    ]);

    // Helper function to queue a state save after an action completes
    const saveStateAfterAction = useCallback(
        (action: string, description: string) => {
            pendingStateSaveRef.current = { action, description };
        },
        []
    );

    // Effect to handle pending state saves when state changes
    useEffect(() => {
        if (pendingStateSaveRef.current) {
            const { action, description } = pendingStateSaveRef.current;
            pendingStateSaveRef.current = null;

            const currentDilutions = dilutionState.dilutions;
            workspaceHistory.push(
                {
                    columns,
                    tableData,
                    formulas,
                    availableFormulas,
                    dilutions: currentDilutions,
                },
                action,
                description
            );
            eventBus.emit("undo-state-updated", {
                canUndo: workspaceHistory.canUndo(),
                count: workspaceHistory.getUndoCount(),
            });
        }
    }, [
        columns,
        tableData,
        formulas,
        availableFormulas,
        dilutionState,
        workspaceHistory,
    ]);

    // Listen to workspace switches and reset undo state
    useEffect(() => {
        const handleWorkspaceSwitched = () => {
            initialStateSaved.current = false;
            const actualCanUndo = workspaceHistory.canUndo();
            const actualUndoCount = workspaceHistory.getUndoCount();
            setUndoState({
                canUndo: actualCanUndo,
                undoCount: actualUndoCount,
            });
        };

        eventBus.on("workspace-switched", handleWorkspaceSwitched);
        return () => {
            eventBus.off("workspace-switched", handleWorkspaceSwitched);
        };
    }, [workspaceActiveTabId, workspaceHistory]);

    // Listen to workspace creation
    useEffect(() => {
        const handleWorkspaceCreated = () => {
            initialStateSaved.current = false;
            setUndoState({
                canUndo: false,
                undoCount: 0,
            });
        };

        eventBus.on("workspace-created", handleWorkspaceCreated);
        return () => {
            eventBus.off("workspace-created", handleWorkspaceCreated);
        };
    }, [workspaceActiveTabId]);

    return {
        undoState,
        ensureInitialStateSaved,
        saveStateAfterAction,
    };
};
