import { useEffect, useRef } from "react";

interface Tab {
  id: string;
  label: string;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const PillTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: PillTabsProps) => {
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

  return (
    <div ref={tabsRef} className={`flex space-x-2 ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
            ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default PillTabs;
