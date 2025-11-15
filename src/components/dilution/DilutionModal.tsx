/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { Dilution, DilutionPreset, Solvent } from "../../types/dilution";
import { DILUTION_PRESETS } from "../../types/dilution";
import { tw } from "../../utils/tailwindToInline";
import Modal from "../Modal";

interface DilutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dilution: Dilution) => void;
  ingredientName: string;
  currentDilution?: Dilution;
  solvents: Solvent[];
}

/**
 * DilutionModal Component
 * Modal for configuring ingredient dilution with solvents and concentration
 */
export const DilutionModal = ({
  isOpen,
  onClose,
  onApply,
  ingredientName,
  currentDilution,
  solvents,
}: DilutionModalProps) => {
  const [selectedSolvent, setSelectedSolvent] = useState<string | null>(
    currentDilution?.solventIds?.[0] || null
  );
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    currentDilution && !currentDilution.isCustom
      ? currentDilution.concentration
      : null
  );
  const [customConcentration, setCustomConcentration] = useState<string>(
    currentDilution?.isCustom
      ? (currentDilution.concentration * 100).toString()
      : ""
  );
  const [showCustomInput, setShowCustomInput] = useState(
    currentDilution?.isCustom || false
  );

  useEffect(() => {
    if (isOpen && currentDilution && currentDilution.solventIds.length > 0) {
      setSelectedSolvent(currentDilution.solventIds[0]);
      if (currentDilution.isCustom) {
        setCustomConcentration(
          (currentDilution.concentration * 100).toString()
        );
        setShowCustomInput(true);
        setSelectedPreset(null);
      } else {
        setSelectedPreset(currentDilution.concentration);
        setShowCustomInput(false);
      }
    } else if (isOpen && !currentDilution) {
      setSelectedSolvent(null);
      setSelectedPreset(null);
      setCustomConcentration("");
      setShowCustomInput(false);
    }
  }, [isOpen, currentDilution]);

  const handleSolventSelect = (solventId: string) => {
    setSelectedSolvent(solventId);
  };

  const handlePresetSelect = (preset: DilutionPreset) => {
    setSelectedPreset(preset.value);
    setShowCustomInput(false);
    setCustomConcentration("");
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    setSelectedPreset(null);
  };

  const handleApply = () => {
    if (!selectedSolvent) {
      toast.error("Please select a solvent");
      return;
    }

    let concentration: number;
    let isCustom: boolean;

    if (showCustomInput) {
      const customValue = parseFloat(customConcentration);
      if (Number.isNaN(customValue) || customValue <= 0 || customValue > 100) {
        toast.error("Please enter a valid concentration between 0 and 100%");
        return;
      }
      concentration = customValue / 100; // Convert to decimal
      isCustom = true;
    } else if (selectedPreset !== null) {
      concentration = selectedPreset;
      isCustom = false;
    } else {
      toast.error(
        "Please select a concentration preset or enter a custom value"
      );
      return;
    }

    const dilution: Dilution = {
      solventIds: [selectedSolvent],
      concentration,
      isCustom,
    };

    onApply(dilution);

    // Show success toast
    const solvent = solvents.find((s) => s.id === selectedSolvent);
    const getPrecision = (conc: number): number => {
      if (conc >= 0.0001) return 4;
      if (conc >= 0.000001) return 6;
      return 7;
    };
    const concentrationPercent = (concentration * 100)
      .toFixed(getPrecision(concentration))
      .replace(/\.?0+$/, "");
    toast.success(
      `Dilution applied: ${ingredientName} in ${concentrationPercent}% ${
        solvent?.code || ""
      }`
    );

    onClose();
  };

  const handleRemoveDilution = () => {
    // Reset all state
    setSelectedSolvent(null);
    setSelectedPreset(null);
    setCustomConcentration("");
    setShowCustomInput(false);

    onApply({
      solventIds: [],
      concentration: 0,
      isCustom: false,
    });

    // Show success toast
    toast.success(`Dilution removed for ${ingredientName}`);

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dilute ${ingredientName}`}
      noPadding
      footerActions={
        <div style={tw("flex items-center justify-between w-full gap-4")}>
          <div>
            {currentDilution && currentDilution.solventIds.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveDilution}
                style={tw(
                  "px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                )}
              >
                Remove Dilution
              </button>
            )}
          </div>
          <div style={tw("flex gap-3")}>
            <button
              type="button"
              onClick={onClose}
              style={tw(
                "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!selectedSolvent}
              style={tw(
                "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
              )}
            >
              Apply Dilution
            </button>
          </div>
        </div>
      }
    >
      <div style={tw("p-6")}>
        <div style={tw("grid grid-cols-2 gap-6")}>
          {/* Section 1: Solvents */}
          <div>
            <h3 style={tw("text-sm font-semibold text-gray-900 mb-3")}>
              Select Solvent
            </h3>
            <div style={tw("space-y-2")}>
              {solvents.map((solvent) => (
                <button
                  key={solvent.id}
                  type="button"
                  onClick={() => handleSolventSelect(solvent.id)}
                  style={tw(
                    `w-full px-3 py-2 text-left rounded-md transition-colors ${
                      selectedSolvent === solvent.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`
                  )}
                >
                  <div style={tw("flex items-center justify-between gap-2")}>
                    <span style={tw("text-sm font-medium truncate")}>
                      {solvent.name}
                    </span>
                    <span style={tw("text-xs flex-shrink-0 opacity-75")}>
                      {solvent.code}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Concentration */}
          <div>
            <h3 style={tw("text-sm font-semibold text-gray-900 mb-3")}>
              Select Concentration
            </h3>

            {/* Preset Buttons */}
            <div style={tw("grid grid-cols-2 gap-2 mb-3")}>
              {DILUTION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  style={tw(
                    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedPreset === preset.value && !showCustomInput
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`
                  )}
                >
                  {preset.display}
                </button>
              ))}
            </div>

            {/* Custom Input Option */}
            <div style={tw("mt-3")}>
              <button
                type="button"
                onClick={handleCustomClick}
                style={tw(
                  `w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    showCustomInput
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`
                )}
              >
                Custom Concentration
              </button>

              {showCustomInput && (
                <div style={tw("mt-3 flex items-center space-x-2")}>
                  <input
                    type="number"
                    value={customConcentration}
                    onChange={(e) => setCustomConcentration(e.target.value)}
                    placeholder="Enter percentage"
                    min="0"
                    max="100"
                    step="0.00001"
                    style={tw(
                      "flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    )}
                  />
                  <span style={tw("text-sm text-gray-600 flex-shrink-0")}>
                    %
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
