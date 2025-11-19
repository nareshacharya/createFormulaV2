import { useState, useEffect } from "react";
import type { Formula } from "../../services/pega";
import { eventBus } from "../../utils/bus";
import { tw } from "../../utils/tailwindToInline";
import { headerTokens } from "../../utils/tokens";
import HeaderActions from "./Header.Actions";
import HeaderBadges from "./Header.Badges";

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
    <div
      style={tw("w-full bg-purple-700 border-b border-purple-700 relative z-1")}
    >
      {/* Header content */}
      <header
        style={tw(
          `${headerTokens.height} ${headerTokens.padding} flex items-center justify-between w-full`
        )}
      >
        <HeaderBadges activeFormula={activeFormula} />
        <HeaderActions />
      </header>
    </div>
  );
};

export default AppHeader;
