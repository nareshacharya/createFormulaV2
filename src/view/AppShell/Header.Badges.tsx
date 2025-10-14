import { useState, useEffect, useRef } from "react";
import type { Formula } from "../../services/pega";
import { eventBus } from "../../utils/bus";

interface HeaderBadgesProps {
  activeFormula?: Formula | null;
}

interface FormulaMetrics {
  lineCount: number;
  targetCost: number;
  formulaCost: number;
}

const HeaderBadges = ({ activeFormula }: HeaderBadgesProps) => {
  const [currentFormula, setCurrentFormula] = useState<Formula | null>(
    activeFormula || null
  );
  const [metrics, setMetrics] = useState<FormulaMetrics>({
    lineCount: 0,
    targetCost: 0,
    formulaCost: 0,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleActiveFormulaChange = (data: { formula: Formula | null }) => {
      setCurrentFormula(data.formula);
    };

    const handleMetricsUpdate = (data: FormulaMetrics) => {
      setMetrics(data);
    };

    eventBus.on("active-formula-changed", handleActiveFormulaChange);
    eventBus.on("active-formula-metrics-updated", handleMetricsUpdate);

    return () => {
      eventBus.off("active-formula-changed", handleActiveFormulaChange);
      eventBus.off("active-formula-metrics-updated", handleMetricsUpdate);
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
      {/* Formula Metrics Container - Project Name, Formula Info, Status, Lines, and Costs */}
      <div className="relative flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-900/50" ref={dropdownRef}>
        {/* Project Name with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-white/50 font-medium">Project</span>
              <span className="text-sm font-semibold text-white">
                {currentFormula?.projectName || "Fragrance Lab Pro"}
              </span>
            </div>
            <i
              className={`ri-arrow-down-s-line text-white text-base transition-transform ${
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

        {/* Vertical Divider */}
        <div className="w-px h-12 bg-purple-600/50"></div>

        {/* Formula Name & ID */}
        <div className="flex flex-col">
          <span className="text-xs text-white/50 font-medium">Formula</span>
          <span className="text-sm font-semibold text-white">
            {currentFormula?.name || "-"}
          </span>
          <span className="text-xs text-white/40">
            {currentFormula?.id || "-"}
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-12 bg-purple-600/50"></div>

        {/* Status */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-white/50 font-medium mb-1">Status</span>
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusVariant(
              currentFormula?.status
            )}`}
          >
            {currentFormula?.status?.toUpperCase() || "NEW"}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-12 bg-purple-600/50"></div>

        {/* Lines Count */}
        <div className="flex items-center gap-2">
          <i className="ri-list-check-2 text-yellow-300 text-xl"></i>
          <div className="flex flex-col">
            <span className="text-xs text-white/50 font-medium">Lines</span>
            <span className="text-base font-semibold text-white">
              {metrics.lineCount}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-12 bg-purple-600/50"></div>

        {/* Formula Cost */}
        <div className="flex items-center gap-2">
          <i className="ri-price-tag-3-line text-green-300 text-xl"></i>
          <div className="flex flex-col">
            <span className="text-xs text-white/50 font-medium">
              Formula Cost
            </span>
            <span className="text-base font-semibold text-white">
              ${metrics.formulaCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-12 bg-purple-600/50"></div>

        {/* Target Cost (RMC) */}
        <div className="flex items-center gap-2">
          <i className="ri-money-dollar-circle-line text-blue-300 text-xl"></i>
          <div className="flex flex-col">
            <span className="text-xs text-white/50 font-medium">
              Target Cost
            </span>
            <span className="text-base font-semibold text-white">
              ${metrics.targetCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBadges;
