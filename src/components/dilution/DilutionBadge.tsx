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

  // Format concentration as percentage
  const concentrationPercent = (dilution.concentration * 100).toFixed(
    // Determine precision based on value
    dilution.concentration >= 0.0001
      ? 4
      : dilution.concentration >= 0.000001
      ? 6
      : 7
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
