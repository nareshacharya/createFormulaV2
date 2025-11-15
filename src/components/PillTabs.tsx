/* eslint-disable jsx-a11y/label-has-associated-control */
import { useEffect, useRef, useMemo, type CSSProperties } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  style?: CSSProperties;
}

const PillTabs = ({ tabs, activeTab, onTabChange, style }: PillTabsProps) => {
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!tabsRef.current?.contains(document.activeElement)) return;

      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      let newIndex = currentIndex;

      if (e.key === "ArrowLeft") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        e.preventDefault();
      }

      if (newIndex !== currentIndex) {
        onTabChange(tabs[newIndex].id);
        const newButton = tabsRef.current?.children[
          newIndex
        ] as HTMLButtonElement;
        newButton?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTab, onTabChange]);

  const containerStyle = useMemo(
    () => mergeStyles(tw("flex gap-1 w-full"), style),
    [style]
  );

  const getTabStyle = useMemo(
    () => (isActive: boolean) => {
      const baseStyle = tw(
        "flex-1 px-2 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1"
      );

      if (isActive) {
        return mergeStyles(baseStyle, tw("bg-blue-600 text-white shadow-sm"));
      }

      return mergeStyles(
        baseStyle,
        tw("bg-white text-gray-700 border border-gray-200")
      );
    },
    []
  );

  return (
    <div ref={tabsRef} style={containerStyle} role="tablist">
      {tabs.map((tab) => (
        <button
                type="button"
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          style={getTabStyle(activeTab === tab.id)}
        >
          {tab.icon && (
            <span className="material-symbols-rounded" style={tw("text-sm")}>
              {tab.icon}
            </span>
          )}
          <span style={tw("truncate")}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default PillTabs;
