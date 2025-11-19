/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import type { Dilution, Solvent } from "../../types/dilution";

interface DilutionBadgeProps {
  dilution: Dilution;
  solvents: Solvent[];
  onClick?: () => void;
}

/**
 * DilutionBadge Component
 * Displays dilution information inline with ingredient name
 * Format: "1% DPG" or "0.1% DPG"
 */
export const DilutionBadge = ({
  dilution,
  solvents,
  onClick,
}: DilutionBadgeProps) => {
  // Get solvent codes from IDs
  const solventCodes = dilution.solventIds
    .map((id) => {
      const solvent = solvents.find((s) => s.id === id);
      return solvent?.code || id;
    })
    .join(" + ");

  // Determine decimal precision based on concentration value
  const getPrecision = (concentration: number): number => {
    if (concentration >= 0.0001) return 4;
    if (concentration >= 0.000001) return 6;
    return 7;
  };

  // Format concentration as percentage
  const concentrationPercent = (dilution.concentration * 100).toFixed(
    getPrecision(dilution.concentration)
  );

  // Remove trailing zeros and decimal point if not needed
  const formattedConcentration = concentrationPercent.replace(/\.?0+$/, "");

  const displayText = `${formattedConcentration}% ${solventCodes}`;

  return (
    <span
      onClick={onClick}
      className={`ml-1 text-xs text-gray-600 ${
        onClick ? "cursor-pointer hover:text-blue-600 hover:underline" : ""
      }`}
      title={onClick ? "Click to edit dilution" : undefined}
    >
      {displayText}
    </span>
  );
};
