import { useState, useCallback } from "react";
import type { SavedView } from "../types";

/**
 * Hook for managing saved views (row orders)
 */
export const useSavedViews = () => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);

  const saveView = useCallback((viewName: string, rowOrder: string[]) => {
    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name: viewName,
      rowOrder,
      timestamp: Date.now(),
    };

    setSavedViews((prev) => [...prev, newView]);
    setCurrentViewId(newView.id);

    // Persist to localStorage
    try {
      const storedViews = localStorage.getItem("dataGridViews");
      const views = storedViews ? JSON.parse(storedViews) : [];
      views.push(newView);
      localStorage.setItem("dataGridViews", JSON.stringify(views));
    } catch (error) {
      console.error("Failed to save view to localStorage:", error);
    }

    return newView.id;
  }, []);

  const loadView = useCallback((viewId: string) => {
    const view = savedViews.find((v) => v.id === viewId);
    if (view) {
      setCurrentViewId(viewId);
      return view.rowOrder;
    }
    return null;
  }, [savedViews]);

  const deleteView = useCallback((viewId: string) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== viewId));

    if (currentViewId === viewId) {
      setCurrentViewId(null);
    }

    // Remove from localStorage
    try {
      const storedViews = localStorage.getItem("dataGridViews");
      if (storedViews) {
        const views = JSON.parse(storedViews);
        const updatedViews = views.filter((v: SavedView) => v.id !== viewId);
        localStorage.setItem("dataGridViews", JSON.stringify(updatedViews));
      }
    } catch (error) {
      console.error("Failed to delete view from localStorage:", error);
    }
  }, [currentViewId]);

  const loadSavedViews = useCallback(() => {
    try {
      const storedViews = localStorage.getItem("dataGridViews");
      if (storedViews) {
        const views = JSON.parse(storedViews);
        setSavedViews(views);
      }
    } catch (error) {
      console.error("Failed to load views from localStorage:", error);
    }
  }, []);

  return {
    savedViews,
    currentViewId,
    saveView,
    loadView,
    deleteView,
    loadSavedViews,
  };
};
