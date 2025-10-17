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
      <div
        className="relative flex items-center gap-3 px-4 py-1 rounded-lg bg-purple-900/50"
        ref={dropdownRef}
      >
        {/* Project Name with Dropdown */}
        <div className="relative group">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-rounded text-purple-300 text-xl">
              folder
            </span>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs text-white/50 font-medium">Project</span>
              <span className="text-sm font-semibold text-white">
                {currentFormula?.projectName || "Fragrance Lab Pro"}
              </span>
            </div>
            <span
              className={`material-symbols-rounded text-white text-base transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[320px] z-50">
              {/* Formula Info - Only visible on small screens */}
              <div className="lg:hidden">
                <div className="px-3 py-2 mb-2">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Formula Name Tile */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-rounded text-pink-600 text-sm">
                          experiment
                        </span>
                        <span className="text-[10px] text-pink-700 font-semibold uppercase tracking-wide">
                          Formula
                        </span>
                      </div>
                      <div className="text-xs text-pink-900 font-semibold truncate">
                        {currentFormula?.name || "-"}
                      </div>
                    </div>

                    {/* Formula ID Tile */}
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-rounded text-cyan-600 text-sm">
                          tag
                        </span>
                        <span className="text-[10px] text-cyan-700 font-semibold uppercase tracking-wide">
                          ID
                        </span>
                      </div>
                      <div className="text-xs text-cyan-900 font-semibold truncate">
                        {currentFormula?.id || "-"}
                      </div>
                    </div>

                    {/* Status Tile */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-rounded text-orange-600 text-sm">
                          check_circle
                        </span>
                        <span className="text-[10px] text-orange-700 font-semibold uppercase tracking-wide">
                          Status
                        </span>
                      </div>
                      <div
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block ${getStatusVariant(
                          currentFormula?.status
                        )}`}
                      >
                        {currentFormula?.status?.toUpperCase() || "NEW"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
              </div>

              {/* Product Info Tile */}
              <div className="px-3 py-2">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-purple-600 text-base">
                      shopping_bag
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                      Product
                    </span>
                  </div>
                  <div className="text-sm text-purple-900 font-semibold">
                    {currentFormula?.name || "-"}
                  </div>
                </div>
              </div>

              {/* Created By Tile */}
              <div className="px-3 py-2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-blue-600 text-base">
                      person
                    </span>
                    <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
                      Created By
                    </span>
                  </div>
                  <div className="text-sm text-blue-900 font-semibold">
                    {currentFormula?.createdBy || "-"}
                  </div>
                </div>
              </div>

              {/* Last Updated Tile */}
              <div className="px-3 py-2">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-rounded text-green-600 text-base">
                      calendar_today
                    </span>
                    <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
                      Last Updated
                    </span>
                  </div>
                  <div className="text-sm text-green-900 font-semibold">
                    {formatDate(currentFormula?.lastUpdated)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-10 bg-purple-600/50"></div>

        {/* Formula Name - Hidden on small screens */}
        <div className="hidden xl:flex items-center gap-2 group">
          <span className="material-symbols-rounded text-pink-300 text-xl">
            experiment
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/50 font-medium">Formula</span>
            <span className="text-sm font-semibold text-white">
              {currentFormula?.name || "-"}
            </span>
          </div>
        </div>

        {/* Vertical Divider - Hidden on small screens */}
        <div className="hidden xl:block w-px h-10 bg-purple-600/50"></div>

        {/* Formula ID - Hidden on small screens */}
        <div className="hidden xl:flex items-center gap-2 group">
          <span className="material-symbols-rounded text-cyan-300 text-xl">
            tag
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/50 font-medium">ID</span>
            <span className="text-sm font-semibold text-white">
              {currentFormula?.id || "-"}
            </span>
          </div>
        </div>

        {/* Vertical Divider - Hidden on small screens */}
        <div className="hidden xl:block w-px h-10 bg-purple-600/50"></div>

        {/* Status - Hidden on small screens */}
        <div className="hidden xl:flex items-center gap-2 group">
          <span className="material-symbols-rounded text-orange-300 text-xl">
            check_circle
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/50 font-medium mb-1">
              Status
            </span>
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusVariant(
                currentFormula?.status
              )}`}
            >
              {currentFormula?.status?.toUpperCase() || "NEW"}
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-10 bg-purple-600/50"></div>

        {/* Lines Count */}
        <div className="flex items-center gap-2 group">
          <span className="material-symbols-rounded text-yellow-300 text-xl">
            checklist
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/50 font-medium hidden xl:inline">
              Lines
            </span>
            <span className="text-sm font-semibold text-white">
              {metrics.lineCount}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-10 bg-purple-600/50"></div>

        {/* Formula Cost */}
        <div className="flex items-center gap-2 group">
          <span className="material-symbols-rounded text-green-300 text-xl">
            local_offer
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/50 font-medium hidden xl:inline">
              Formula Cost
            </span>
            <span className="text-sm font-semibold text-white">
              ${metrics.formulaCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-10 bg-purple-600/50"></div>

        {/* Target Cost (RMC) */}
        <div className="flex items-center gap-2 group">
          <span className="material-symbols-rounded text-blue-300 text-xl">
            attach_money
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xs text-white/50 font-medium hidden xl:inline">
              Target Cost
            </span>
            <span className="text-sm font-semibold text-white">
              ${metrics.targetCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBadges;
