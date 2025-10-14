import { useState, useEffect, useRef } from "react";
import type { Formula } from "../../services/pega";
import { eventBus } from "../../utils/bus";

interface HeaderBadgesProps {
  activeFormula?: Formula | null;
}

const HeaderBadges = ({ activeFormula }: HeaderBadgesProps) => {
  const [currentFormula, setCurrentFormula] = useState<Formula | null>(
    activeFormula || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleActiveFormulaChange = (data: { formula: Formula | null }) => {
      setCurrentFormula(data.formula);
    };

    eventBus.on("active-formula-changed", handleActiveFormulaChange);

    return () => {
      eventBus.off("active-formula-changed", handleActiveFormulaChange);
    };
  }, []);

  useEffect(() => {
    setCurrentFormula(activeFormula || null);
  }, [activeFormula]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-400/30 text-green-300 border border-green-400/50";
      case "draft":
        return "bg-yellow-400/30 text-yellow-300 border border-yellow-400/50";
      case "archived":
        return "bg-gray-400/30 text-gray-300 border border-gray-400/50";
      default:
        return "bg-blue-400/30 text-blue-300 border border-blue-400/50";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-6">
      {/* Project Name with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-semibold text-white">
              {currentFormula?.projectName || "Fragrance Lab Pro"}
            </span>
          </div>
          <i
            className={`ri-arrow-down-s-line text-white text-xl transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          ></i>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 min-w-[280px] z-50">
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Product
              </div>
              <div className="text-sm text-white font-medium">
                {currentFormula?.name || "-"}
              </div>
            </div>
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Created By
              </div>
              <div className="text-sm text-white font-medium">
                {currentFormula?.createdBy || "-"}
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Last Updated
              </div>
              <div className="text-sm text-white font-medium">
                {formatDate(currentFormula?.lastUpdated)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formula ID and Status - Side by Side */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-normal text-white/60">
          {currentFormula?.id || "-"}
        </span>
        <div
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusVariant(
            currentFormula?.status
          )}`}
        >
          {currentFormula?.status?.toUpperCase() || "NEW"}
        </div>
      </div>
    </div>
  );
};

export default HeaderBadges;
