import { useState, useEffect, useRef } from "react";
import { useHeaderFeatures } from "../../hooks/useFeatureFlags";
import type { Formula } from "../../services/pega";
import { eventBus } from "../../utils/bus";
import { tw, mergeStyles } from "../../utils/tailwindToInline";

interface HeaderBadgesProps {
  activeFormula?: Formula | null;
}

interface FormulaMetrics {
  lineCount: number;
  targetCost: number;
  formulaCost: number;
}

const HeaderBadges = ({ activeFormula }: HeaderBadgesProps) => {
  const headerFlags = useHeaderFeatures();
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
    <div style={mergeStyles(tw("flex items-center"), { gap: "1.5rem" })}>
      {/* Formula Metrics Container - Project Name, Formula Info, Status, Lines, and Costs */}
      <div
        style={mergeStyles(
          tw(
            "relative flex items-center px-4 py-1 rounded-lg bg-purple-900/50"
          ),
          { gap: "0.75rem" }
        )}
        ref={dropdownRef}
      >
        {/* Project Name with Dropdown */}
        <div style={tw("relative group")}>
          <button
                  type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={mergeStyles(
              tw("flex items-center hover:opacity-80 transition-opacity"),
              { gap: "0.5rem" }
            )}
          >
            <span
              style={tw("text-purple-300 text-xl")}
              className="material-symbols-rounded"
            >
              folder
            </span>
            <div
              style={mergeStyles(tw("flex flex-col items-start"), {
                gap: "0.125rem",
              })}
            >
              <span style={tw("text-xs text-white/50 font-medium")}>
                Project
              </span>
              <span style={tw("text-sm font-semibold text-white")}>
                {currentFormula?.projectName || "Fragrance Lab Pro"}
              </span>
            </div>
            <span
              style={mergeStyles(
                tw("text-white text-base transition-transform"),
                tw(isDropdownOpen ? "rotate-180" : "")
              )}
              className="material-symbols-rounded"
            >
              expand_more
            </span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={mergeStyles(
                tw(
                  "absolute top-full left-0 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                ),
                { marginTop: "0.5rem", minWidth: "320px" }
              )}
            >
              {/* Formula Info - Only visible on small screens */}
              <div style={tw("lg:hidden")}>
                <div style={tw("px-3 py-2 mb-2")}>
                  <div
                    style={mergeStyles(tw("grid grid-cols-3"), {
                      gap: "0.5rem",
                    })}
                  >
                    {/* Formula Name Tile */}
                    <div
                      style={tw(
                        "bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200"
                      )}
                    >
                      <div
                        style={mergeStyles(tw("flex items-center mb-1"), {
                          gap: "0.25rem",
                        })}
                      >
                        <span
                          style={tw("text-pink-600 text-sm")}
                          className="material-symbols-rounded"
                        >
                          experiment
                        </span>
                        <span
                          style={tw(
                            "text-[10px] text-pink-700 font-semibold uppercase tracking-wide"
                          )}
                        >
                          Formula
                        </span>
                      </div>
                      <div
                        style={tw(
                          "text-xs text-pink-900 font-semibold truncate"
                        )}
                      >
                        {currentFormula?.name || "-"}
                      </div>
                    </div>

                    {/* Formula ID Tile */}
                    <div
                      style={tw(
                        "bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200"
                      )}
                    >
                      <div
                        style={mergeStyles(tw("flex items-center mb-1"), {
                          gap: "0.25rem",
                        })}
                      >
                        <span
                          style={tw("text-cyan-600 text-sm")}
                          className="material-symbols-rounded"
                        >
                          tag
                        </span>
                        <span
                          style={tw(
                            "text-[10px] text-cyan-700 font-semibold uppercase tracking-wide"
                          )}
                        >
                          ID
                        </span>
                      </div>
                      <div
                        style={tw(
                          "text-xs text-cyan-900 font-semibold truncate"
                        )}
                      >
                        {currentFormula?.id || "-"}
                      </div>
                    </div>

                    {/* Status Tile */}
                    <div
                      style={tw(
                        "bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200"
                      )}
                    >
                      <div
                        style={mergeStyles(tw("flex items-center mb-1"), {
                          gap: "0.25rem",
                        })}
                      >
                        <span
                          style={tw("text-orange-600 text-sm")}
                          className="material-symbols-rounded"
                        >
                          check_circle
                        </span>
                        <span
                          style={tw(
                            "text-[10px] text-orange-700 font-semibold uppercase tracking-wide"
                          )}
                        >
                          Status
                        </span>
                      </div>
                      <div
                        style={tw(
                          `px-2 py-0.5 rounded-full text-[9px] font-bold inline-block ${getStatusVariant(
                            currentFormula?.status
                          )}`
                        )}
                      >
                        {currentFormula?.status?.toUpperCase() || "NEW"}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={tw("border-t border-gray-200 my-2")}></div>
              </div>

              {/* Product Info Tile */}
              <div style={tw("px-3 py-2")}>
                <div
                  style={tw(
                    "bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200"
                  )}
                >
                  <div
                    style={mergeStyles(tw("flex items-center mb-2"), {
                      gap: "0.5rem",
                    })}
                  >
                    <span
                      style={tw("text-purple-600 text-base")}
                      className="material-symbols-rounded"
                    >
                      shopping_bag
                    </span>
                    <span
                      style={tw(
                        "text-[10px] text-purple-700 font-bold uppercase tracking-wider"
                      )}
                    >
                      Product
                    </span>
                  </div>
                  <div style={tw("text-sm text-purple-900 font-semibold")}>
                    {currentFormula?.name || "-"}
                  </div>
                </div>
              </div>

              {/* Created By Tile */}
              <div style={tw("px-3 py-2")}>
                <div
                  style={tw(
                    "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200"
                  )}
                >
                  <div
                    style={mergeStyles(tw("flex items-center mb-2"), {
                      gap: "0.5rem",
                    })}
                  >
                    <span
                      style={tw("text-blue-600 text-base")}
                      className="material-symbols-rounded"
                    >
                      person
                    </span>
                    <span
                      style={tw(
                        "text-[10px] text-blue-700 font-bold uppercase tracking-wider"
                      )}
                    >
                      Created By
                    </span>
                  </div>
                  <div style={tw("text-sm text-blue-900 font-semibold")}>
                    {currentFormula?.createdBy || "-"}
                  </div>
                </div>
              </div>

              {/* Last Updated Tile */}
              <div style={tw("px-3 py-2")}>
                <div
                  style={tw(
                    "bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200"
                  )}
                >
                  <div
                    style={mergeStyles(tw("flex items-center mb-2"), {
                      gap: "0.5rem",
                    })}
                  >
                    <span
                      style={tw("text-green-600 text-base")}
                      className="material-symbols-rounded"
                    >
                      calendar_today
                    </span>
                    <span
                      style={tw(
                        "text-[10px] text-green-700 font-bold uppercase tracking-wider"
                      )}
                    >
                      Last Updated
                    </span>
                  </div>
                  <div style={tw("text-sm text-green-900 font-semibold")}>
                    {formatDate(currentFormula?.lastUpdated)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div
          style={mergeStyles(
            { width: "1px", height: "2.5rem" },
            tw("bg-purple-600/50")
          )}
        ></div>

        {/* Vertical Divider - Hidden on small screens */}
        <div
          style={mergeStyles(tw("hidden xl:block bg-purple-600/50"), {
            width: "1px",
            height: "2.5rem",
          })}
        ></div>

        {/* Formula Name - Hidden on small screens */}
        {headerFlags.showFormulaName && (
          <div
            style={mergeStyles(tw("hidden xl:flex items-center group"), {
              gap: "0.5rem",
            })}
          >
            <span
              style={tw("text-pink-300 text-xl")}
              className="material-symbols-rounded"
            >
              experiment
            </span>
            <div style={tw("flex flex-col items-start")}>
              <span style={tw("text-xs text-white/50 font-medium")}>
                Formula
              </span>
              <span style={tw("text-sm font-semibold text-white")}>
                {currentFormula?.name || "-"}
              </span>
            </div>
          </div>
        )}

        {/* Vertical Divider - Hidden on small screens */}
        {headerFlags.showFormulaId && (
          <div
            style={mergeStyles(tw("hidden xl:block bg-purple-600/50"), {
              width: "1px",
              height: "2.5rem",
            })}
          ></div>
        )}

        {/* Formula ID - Hidden on small screens */}
        {headerFlags.showFormulaId && (
          <div
            style={mergeStyles(tw("hidden xl:flex items-center group"), {
              gap: "0.5rem",
            })}
          >
            <span
              style={tw("text-cyan-300 text-xl")}
              className="material-symbols-rounded"
            >
              tag
            </span>
            <div style={tw("flex flex-col items-start")}>
              <span style={tw("text-xs text-white/50 font-medium")}>ID</span>
              <span style={tw("text-sm font-semibold text-white")}>
                {currentFormula?.id || "-"}
              </span>
            </div>
          </div>
        )}

        {/* Vertical Divider - Hidden on small screens */}
        {headerFlags.showFormulaStatus && (
          <div
            style={mergeStyles(tw("hidden xl:block bg-purple-600/50"), {
              width: "1px",
              height: "2.5rem",
            })}
          ></div>
        )}

        {/* Status - Hidden on small screens */}
        {headerFlags.showFormulaStatus && (
          <div
            style={mergeStyles(tw("hidden xl:flex items-center group"), {
              gap: "0.5rem",
            })}
          >
            <span
              style={tw("text-orange-300 text-xl")}
              className="material-symbols-rounded"
            >
              check_circle
            </span>
            <div style={tw("flex flex-col items-start")}>
              <span style={tw("text-xs text-white/50 font-medium mb-1")}>
                Status
              </span>
              <div
                style={tw(
                  `px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusVariant(
                    currentFormula?.status
                  )}`
                )}
              >
                {currentFormula?.status?.toUpperCase() || "NEW"}
              </div>
            </div>
          </div>
        )}

        {/* Vertical Divider */}
        {headerFlags.showLineCount && (
          <div
            style={mergeStyles(
              { width: "1px", height: "2.5rem" },
              tw("bg-purple-600/50")
            )}
          ></div>
        )}

        {/* Lines Count */}
        {headerFlags.showLineCount && (
          <div
            style={mergeStyles(tw("flex items-center group"), {
              gap: "0.5rem",
            })}
          >
            <span
              style={tw("text-yellow-300 text-xl")}
              className="material-symbols-rounded"
            >
              checklist
            </span>
            <div style={tw("flex flex-col items-start")}>
              <span
                style={tw("text-xs text-white/50 font-medium hidden xl:inline")}
              >
                Lines
              </span>
              <span style={tw("text-sm font-semibold text-white")}>
                {metrics.lineCount}
              </span>
            </div>
          </div>
        )}

        {/* Vertical Divider */}
        {headerFlags.showFormulaCost && (
          <div
            style={mergeStyles(
              { width: "1px", height: "2.5rem" },
              tw("bg-purple-600/50")
            )}
          ></div>
        )}

        {/* Formula Cost */}
        {headerFlags.showFormulaCost && (
          <div
            style={mergeStyles(tw("flex items-center group"), {
              gap: "0.5rem",
            })}
          >
            <span
              style={tw("text-green-300 text-xl")}
              className="material-symbols-rounded"
            >
              local_offer
            </span>
            <div style={tw("flex flex-col items-start")}>
              <span
                style={tw("text-xs text-white/50 font-medium hidden xl:inline")}
              >
                Formula Cost
              </span>
              <span style={tw("text-sm font-semibold text-white")}>
                ${metrics.formulaCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Vertical Divider */}
        {headerFlags.showTargetCost && (
          <div
            style={mergeStyles(
              { width: "1px", height: "2.5rem" },
              tw("bg-purple-600/50")
            )}
          ></div>
        )}

        {/* Target Cost (RMC) */}
        {headerFlags.showTargetCost && (
          <div
            style={mergeStyles(tw("flex items-center group"), {
              gap: "0.5rem",
            })}
          >
            <span
              style={tw("text-blue-300 text-xl")}
              className="material-symbols-rounded"
            >
              attach_money
            </span>
            <div style={tw("flex flex-col items-start")}>
              <span
                style={tw("text-xs text-white/50 font-medium hidden xl:inline")}
              >
                Target Cost
              </span>
              <span style={tw("text-sm font-semibold text-white")}>
                ${metrics.targetCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Vertical Divider */}
        <div
          style={mergeStyles(
            { width: "1px", height: "2.5rem" },
            tw("bg-purple-600/50")
          )}
        ></div>

        {/* Lines Count */}
        <div
          style={mergeStyles(tw("flex items-center group"), { gap: "0.5rem" })}
        >
          <span
            style={tw("text-yellow-300 text-xl")}
            className="material-symbols-rounded"
          >
            checklist
          </span>
          <div style={tw("flex flex-col items-start")}>
            <span
              style={tw("text-xs text-white/50 font-medium hidden xl:inline")}
            >
              Lines
            </span>
            <span style={tw("text-sm font-semibold text-white")}>
              {metrics.lineCount}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div
          style={mergeStyles(
            { width: "1px", height: "2.5rem" },
            tw("bg-purple-600/50")
          )}
        ></div>

        {/* Formula Cost */}
        <div
          style={mergeStyles(tw("flex items-center group"), { gap: "0.5rem" })}
        >
          <span
            style={tw("text-green-300 text-xl")}
            className="material-symbols-rounded"
          >
            local_offer
          </span>
          <div style={tw("flex flex-col items-start")}>
            <span
              style={tw("text-xs text-white/50 font-medium hidden xl:inline")}
            >
              Formula Cost
            </span>
            <span style={tw("text-sm font-semibold text-white")}>
              ${metrics.formulaCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div
          style={mergeStyles(
            { width: "1px", height: "2.5rem" },
            tw("bg-purple-600/50")
          )}
        ></div>

        {/* Target Cost (RMC) */}
        <div
          style={mergeStyles(tw("flex items-center group"), { gap: "0.5rem" })}
        >
          <span
            style={tw("text-blue-300 text-xl")}
            className="material-symbols-rounded"
          >
            attach_money
          </span>
          <div style={tw("flex flex-col items-start")}>
            <span
              style={tw("text-xs text-white/50 font-medium hidden xl:inline")}
            >
              Target Cost
            </span>
            <span style={tw("text-sm font-semibold text-white")}>
              ${metrics.targetCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBadges;
