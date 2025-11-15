/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * Workspace Manager
 * 
 * Manages multiple workspaces for the application, allowing users to save
 * and switch between different work states. Each workspace contains:
 * - Complete DataGrid state (columns, data, formulas)
 * - Selected formulas and their state
 * - Ingredient selections
 * - Attribute filters
 * - Active formula
 * - UI state (expanded rows, grouping, etc.)
 * 
 * Uses localStorage for persistence with a maximum of 3 workspaces.
 */

export interface WorkspaceState {
    // DataGrid Core State
    columns: unknown[];           // Column definitions with all metadata
    tableData: unknown[];         // All row data including ingredients and totals

    // Formula State
    formulas: unknown[];          // Currently loaded formulas in workspace
    availableFormulas: unknown[]; // All formulas available in library
    selectedFormulas: unknown[];  // Formula objects for selected formulas
    selectedFormulaIds: string[]; // IDs of formulas added to grid
    editableFormula: string | null; // Active formula column ID
    activeFormulaId: string | null; // Active formula ID (for compatibility)

    // Ingredient State
    ingredients: unknown[];       // All ingredients in workspace
    expandedIngredients: string[]; // IDs of expanded formula rows

    // Attribute State
    attributes: unknown[];        // All attributes in workspace
    selectedAttributes: string[]; // IDs of attributes added to grid

    // UI State
    groupedByColumn: string | null; // Column ID for grouping
    filters: Record<string, unknown>; // Active filters
    sortConfig: {
        key: string;
        direction: 'asc' | 'desc';
    } | null;

    // Metadata
    lastModified: string;
}

export interface Workspace {
    id: string;
    name: string;
    state: WorkspaceState;
    createdAt: string;
    lastModified: string;
}

const STORAGE_KEY = 'pega_workspaces';
const MAX_WORKSPACES = 3;
const ACTIVE_WORKSPACE_KEY = 'pega_active_workspace_id';

/**
 * Create an empty workspace state with all required fields
 */
const createEmptyWorkspaceState = (): WorkspaceState => ({
    // DataGrid Core State
    columns: [],
    tableData: [],

    // Formula State
    formulas: [],
    availableFormulas: [],
    selectedFormulas: [],
    selectedFormulaIds: [],
    editableFormula: null,
    activeFormulaId: null,

    // Ingredient State
    ingredients: [],
    expandedIngredients: [],

    // Attribute State
    attributes: [],
    selectedAttributes: [],

    // UI State
    groupedByColumn: null,
    filters: {},
    sortConfig: null,

    // Metadata
    lastModified: new Date().toISOString(),
});

/**
 * Initialize default workspaces (Alpha, Beta, Gamma) if none exist
 */
export const initializeDefaultWorkspaces = (): void => {
    const existingWorkspaces = getWorkspaces();

    // Only initialize if no workspaces exist
    if (existingWorkspaces.length === 0) {
        const defaultWorkspaces: Workspace[] = [
            {
                id: "workspace_alpha",
                name: "Alpha",
                state: createEmptyWorkspaceState(),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
            },
            {
                id: "workspace_beta",
                name: "Beta",
                state: createEmptyWorkspaceState(),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
            },
            {
                id: "workspace_gamma",
                name: "Gamma",
                state: createEmptyWorkspaceState(),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
            },
        ];

        // Save default workspaces
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkspaces));

        // Set Alpha as the active workspace
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, "workspace_alpha");
    }
};

/**
 * Get all saved workspaces
 */
export const getWorkspaces = (): Workspace[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Initialize defaults if no workspaces exist
            initializeDefaultWorkspaces();
            const newStored = localStorage.getItem(STORAGE_KEY);
            return newStored ? JSON.parse(newStored) : [];
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading workspaces:', error);
        return [];
    }
};

/**
 * Get active workspace ID
 */
export const getActiveWorkspaceId = (): string | null => {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
};

/**
 * Set active workspace ID
 */
export const setActiveWorkspaceId = (id: string | null): void => {
    if (id) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
    } else {
        localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
};

/**
 * Get active workspace
 */
export const getActiveWorkspace = (): Workspace | null => {
    const activeId = getActiveWorkspaceId();
    if (!activeId) return null;

    const workspaces = getWorkspaces();
    return workspaces.find(w => w.id === activeId) || null;
};

/**
 * Get a specific workspace by ID
 */
export const getWorkspace = (id: string): Workspace | null => {
    const workspaces = getWorkspaces();
    return workspaces.find(w => w.id === id) || null;
};

/**
 * Save or update a workspace
 */
export const saveWorkspace = (name: string, state: WorkspaceState, id?: string): Workspace => {
    const workspaces = getWorkspaces();
    const now = new Date().toISOString();

    if (id) {
        // Update existing workspace
        const index = workspaces.findIndex(w => w.id === id);
        if (index !== -1) {
            workspaces[index] = {
                ...workspaces[index],
                name,
                state,
                lastModified: now,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
            return workspaces[index];
        }
    }

    // Create new workspace
    if (workspaces.length >= MAX_WORKSPACES) {
        throw new Error(`Maximum of ${MAX_WORKSPACES} workspaces allowed`);
    }

    const newWorkspace: Workspace = {
        id: `workspace_${Date.now()}`,
        name,
        state,
        createdAt: now,
        lastModified: now,
    };

    workspaces.push(newWorkspace);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));

    // Set as active workspace
    setActiveWorkspaceId(newWorkspace.id);

    return newWorkspace;
};

/**
 * Delete a workspace
 */
export const deleteWorkspace = (id: string): boolean => {
    const workspaces = getWorkspaces();
    const filtered = workspaces.filter(w => w.id !== id);

    if (filtered.length === workspaces.length) {
        return false; // Workspace not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // If deleted workspace was active, clear active workspace
    if (getActiveWorkspaceId() === id) {
        setActiveWorkspaceId(null);
    }

    return true;
};

/**
 * Rename a workspace
 */
export const renameWorkspace = (id: string, newName: string): boolean => {
    const workspaces = getWorkspaces();
    const workspace = workspaces.find(w => w.id === id);

    if (!workspace) return false;

    workspace.name = newName;
    workspace.lastModified = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    return true;
};

/**
 * Check if can create more workspaces
 */
export const canCreateWorkspace = (): boolean => {
    return getWorkspaces().length < MAX_WORKSPACES;
};

/**
 * Get workspace count
 */
export const getWorkspaceCount = (): number => {
    return getWorkspaces().length;
};

/**
 * Clear all workspaces (useful for debugging/reset)
 */
export const clearAllWorkspaces = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
};

/**
 * Load a workspace by ID and emit event to restore its state
 * This is a convenience function that combines getting the workspace
 * and triggering the load event
 */
export const loadWorkspaceById = (workspaceId: string): boolean => {
    const workspace = getWorkspace(workspaceId);

    if (!workspace) {
        console.error(`Workspace ${workspaceId} not found`);
        return false;
    }

    // Import eventBus dynamically to avoid circular dependencies
    import('../utils/bus').then(({ eventBus }) => {
        eventBus.emit("load-workspace-state", { state: workspace.state });
    });

    setActiveWorkspaceId(workspaceId);
    return true;
};
