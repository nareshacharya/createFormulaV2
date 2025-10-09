import { useState, useEffect } from "react";
import type { Formula } from "../../services/pega";
import { eventBus } from "../../utils/bus";

interface HeaderBadgesProps {
  activeFormula?: Formula | null;
}

const HeaderBadges = ({ activeFormula }: HeaderBadgesProps) => {
  const [currentFormula, setCurrentFormula] = useState<Formula | null>(
    activeFormula || null
  );

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

  const badges = [
    {
      label: "Formula ID",
      value: currentFormula?.id || "-",
      variant: "default" as const,
    },
    {
      label: "Project",
      value: "Fragrance Lab Pro",
      variant: "default" as const,
    },
    {
      label: "Product",
      value: currentFormula?.name || "-",
      variant: "default" as const,
    },
    {
      label: "Version",
      value: currentFormula?.version || "-",
      variant: "default" as const,
    },
    {
      label: "Created By",
      value: currentFormula?.createdBy || "-",
      variant: "default" as const,
    },
    {
      label: "Last Updated",
      value: formatDate(currentFormula?.lastUpdated),
      variant: "default" as const,
    },
    {
      label: "Status",
      value: currentFormula?.status?.toUpperCase() || "NEW",
      variant: "status" as const,
    },
  ];

  return (
    <div className="flex items-center gap-6">
      {badges.map((badge, index) => (
        <div key={index} className="flex flex-col items-start gap-0.5 min-w-0">
          <span className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
            {badge.label}
          </span>
          <div
            className={`
            whitespace-nowrap
            ${
              badge.variant === "status"
                ? `px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusVariant(currentFormula?.status)}`
                : "text-sm font-medium text-white"
            }
          `}
          >
            {badge.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeaderBadges;
