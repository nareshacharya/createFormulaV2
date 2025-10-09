import { useState, useEffect } from "react";
import { headerTokens } from "../../utils/tokens";
import HeaderBadges from "./Header.Badges";
import HeaderActions from "./Header.Actions";
import { eventBus } from "../../utils/bus";
import type { Formula } from "../../services/pega";

const AppHeader = () => {
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);

  useEffect(() => {
    const handleActiveFormulaChange = (data: { formula: Formula | null }) => {
      setActiveFormula(data.formula);
    };

    eventBus.on("active-formula-changed", handleActiveFormulaChange);

    return () => {
      eventBus.off("active-formula-changed", handleActiveFormulaChange);
    };
  }, []);

  return (
    <div className="w-full bg-purple-800 border-b border-purple-700 relative z-1">
      {/* Header content */}
      <header
        className={`${headerTokens.height} ${headerTokens.padding} flex items-center justify-between w-full`}
      >
        <HeaderBadges activeFormula={activeFormula} />
        <HeaderActions />
      </header>
    </div>
  );
};

export default AppHeader;
