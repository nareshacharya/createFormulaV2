import React, { createContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import type {
  Formula,
  Ingredient,
  IngredientAttribute,
} from "../services/pega";
import type { Column } from "../components/DataGrid";

interface WorkspaceData {
  columns: Column[];
  tableData: Record<string, unknown>[];
  selectedFormulaIds: string[];
  editableFormula: string | null;
  selectedAttributes: string[];
  selectedFormulas: Formula[];
  formulas: Formula[];
  lockedFormulas: Set<string>; // Formulas used in this workspace
}

interface WorkspaceTab {
  id: string;
  name: string;
  lastModified: Date;
  isDefault: boolean;
  data: WorkspaceData;
}

interface WorkspaceContextType {
  // Workspace Tab Management
  tabs: WorkspaceTab[];
  activeTabId: string;
  activeWorkspace: WorkspaceData;
  addTab: () => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  renameTab: (tabId: string, newName: string) => void;

  // Session Management
  resetWorkspace: (tabId: string) => void;
  updateWorkspaceData: (data: Partial<WorkspaceData>) => void;

  // Formula Locking
  isFormulaLocked: (formulaId: string) => boolean;
  getFormulaLockedInWorkspace: (formulaId: string) => string | null;
  lockFormula: (formulaId: string) => void;
  unlockFormula: (formulaId: string) => void;

  // Global Data
  availableFormulas: Formula[];
  ingredients: Ingredient[];
  attributes: IngredientAttribute[];
  setAvailableFormulas: (formulas: Formula[]) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  setAttributes: (attributes: IngredientAttribute[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

const MAX_TABS = 3;
const DEFAULT_TAB_NAME = "Alpha";

const createEmptyWorkspaceData = (): WorkspaceData => ({
  columns: [
    {
      id: "description",
      key: "description",
      title: "Description",
      type: "text",
      sortable: true,
      editable: false,
      group: "Ingredient",
      width: 200,
    },
    {
      id: "costKg",
      key: "costKg",
      title: "Cost/Kg",
      type: "number",
      sortable: true,
      editable: false,
      group: "Ingredient",
      width: 100,
    },
    {
      id: "formulaAdd",
      key: "formulaAdd",
      title: "+ Formula",
      type: "add-column",
      sortable: false,
      editable: false,
      group: "Formulas",
      width: 120,
    },
    {
      id: "contCost",
      key: "contCost",
      title: "Cont Cost",
      type: "number",
      sortable: true,
      editable: false,
      group: "Contribution",
      width: 100,
    },
    {
      id: "attributeAdd",
      key: "attributeAdd",
      title: "+ Attribute",
      type: "add-column",
      sortable: false,
      editable: false,
      group: "Attributes",
      width: 120,
    },
  ],
  tableData: [],
  selectedFormulaIds: [],
  editableFormula: null,
  selectedAttributes: [],
  selectedFormulas: [],
  formulas: [],
  lockedFormulas: new Set<string>(),
});

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    {
      id: "default",
      name: DEFAULT_TAB_NAME,
      lastModified: new Date(),
      isDefault: true,
      data: createEmptyWorkspaceData(),
    },
  ]);

  const [activeTabId, setActiveTabId] = useState("default");

  // Global data shared across all workspaces
  const [availableFormulas, setAvailableFormulas] = useState<Formula[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [attributes, setAttributes] = useState<IngredientAttribute[]>([]);

  const activeWorkspace =
    tabs.find((tab) => tab.id === activeTabId)?.data ||
    createEmptyWorkspaceData();

  const addTab = useCallback(() => {
    if (tabs.length >= MAX_TABS) {
      toast.error(`Maximum of ${MAX_TABS} tabs allowed`);
      return;
    }

    const newTab: WorkspaceTab = {
      id: `tab-${Date.now()}`,
      name: `Workspace ${tabs.length + 1}`,
      lastModified: new Date(),
      isDefault: false,
      data: createEmptyWorkspaceData(),
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    toast.success(
      `New workspace "${newTab.name}" created - Fresh session started`
    );
  }, [tabs.length]);

  const closeTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab?.isDefault) {
        toast.error("Cannot close the default workspace");
        return;
      }

      // Unlock all formulas from this workspace
      const tabData = tabs.find((t) => t.id === tabId)?.data;
      if (tabData) {
        tabData.lockedFormulas.clear();
      }

      const updatedTabs = tabs.filter((t) => t.id !== tabId);
      setTabs(updatedTabs);

      // If closing active tab, switch to first tab
      if (activeTabId === tabId) {
        setActiveTabId(updatedTabs[0].id);
      }

      toast.success(`Workspace "${tab?.name}" closed`);
    },
    [tabs, activeTabId]
  );

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const renameTab = useCallback((tabId: string, newName: string) => {
    if (!newName.trim()) return;

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? { ...tab, name: newName.trim(), lastModified: new Date() }
          : tab
      )
    );

    toast.success("Workspace renamed");
  }, []);

  const resetWorkspace = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === tabId) {
          // Unlock all formulas from this workspace before resetting
          tab.data.lockedFormulas.clear();

          return {
            ...tab,
            data: createEmptyWorkspaceData(),
            lastModified: new Date(),
          };
        }
        return tab;
      })
    );
    toast.success("Workspace reset to fresh state");
  }, []);

  const updateWorkspaceData = useCallback(
    (data: Partial<WorkspaceData>) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            return {
              ...tab,
              data: { ...tab.data, ...data },
              lastModified: new Date(),
            };
          }
          return tab;
        })
      );
    },
    [activeTabId]
  );

  // Check if formula is locked in ANY workspace
  const isFormulaLocked = useCallback(
    (formulaId: string): boolean => {
      return tabs.some(
        (tab) =>
          tab.id !== activeTabId && tab.data.lockedFormulas.has(formulaId)
      );
    },
    [tabs, activeTabId]
  );

  // Get the workspace name where formula is locked
  const getFormulaLockedInWorkspace = useCallback(
    (formulaId: string): string | null => {
      const lockedTab = tabs.find(
        (tab) =>
          tab.id !== activeTabId && tab.data.lockedFormulas.has(formulaId)
      );
      return lockedTab ? lockedTab.name : null;
    },
    [tabs, activeTabId]
  );

  const lockFormula = useCallback(
    (formulaId: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            const newLockedFormulas = new Set(tab.data.lockedFormulas);
            newLockedFormulas.add(formulaId);
            return {
              ...tab,
              data: { ...tab.data, lockedFormulas: newLockedFormulas },
            };
          }
          return tab;
        })
      );
    },
    [activeTabId]
  );

  const unlockFormula = useCallback(
    (formulaId: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === activeTabId) {
            const newLockedFormulas = new Set(tab.data.lockedFormulas);
            newLockedFormulas.delete(formulaId);
            return {
              ...tab,
              data: { ...tab.data, lockedFormulas: newLockedFormulas },
            };
          }
          return tab;
        })
      );
    },
    [activeTabId]
  );

  const value: WorkspaceContextType = {
    tabs,
    activeTabId,
    activeWorkspace,
    addTab,
    closeTab,
    switchTab,
    renameTab,
    resetWorkspace,
    updateWorkspaceData,
    isFormulaLocked,
    getFormulaLockedInWorkspace,
    lockFormula,
    unlockFormula,
    availableFormulas,
    ingredients,
    attributes,
    setAvailableFormulas,
    setIngredients,
    setAttributes,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// Export context for useContext hook
export { WorkspaceContext };
export type { WorkspaceContextType };
