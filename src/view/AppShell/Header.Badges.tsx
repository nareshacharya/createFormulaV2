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
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
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
      label: "Project",
      value: "Fragrance Lab Pro",
      variant: "default" as const,
    },
    {
      label: "Status",
      value: currentFormula?.status?.toUpperCase() || "NEW",
      variant: "status" as const,
    },
    {
      label: "Market",
      value: "EU",
      variant: "default" as const,
    },
    {
      label: "Formula ID",
      value: currentFormula?.id || "-",
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
  ];

  return (
    <div className="flex items-center gap-3">
      {badges.map((badge, index) => (
        <div key={index} className="flex flex-col items-start gap-1 min-w-0">
          <span className="text-white/60 text-xs font-medium uppercase tracking-wide">
            {badge.label}
          </span>
          <div
            className={`
            px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap
            ${
              badge.variant === "status"
                ? getStatusVariant(currentFormula?.status)
                : "bg-white/10 text-white border border-white/20"
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
