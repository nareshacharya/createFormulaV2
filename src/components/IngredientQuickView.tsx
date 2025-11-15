import { useState, lazy, Suspense } from "react";
import type { Ingredient } from "../services/pega";
import { eventBus } from "../utils/bus";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Button from "./Button";
import Modal from "./Modal";

// Lazy load sections for better performance
const OverviewSection = lazy(
  () => import("./IngredientSections/OverviewSection")
);
const ChemicalStructureSection = lazy(
  () => import("./IngredientSections/ChemicalStructureSection")
);
const PhysicalPropertiesSection = lazy(
  () => import("./IngredientSections/PhysicalPropertiesSection")
);
const ChemicalPropertiesSection = lazy(
  () => import("./IngredientSections/ChemicalPropertiesSection")
);
const ComplianceSection = lazy(
  () => import("./IngredientSections/ComplianceSection")
);
const SuppliersSection = lazy(
  () => import("./IngredientSections/SuppliersSection")
);
const DocumentsSection = lazy(
  () => import("./IngredientSections/DocumentsSection")
);

interface IngredientQuickViewProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

const IngredientQuickView = ({
  ingredient,
  isOpen,
  onClose,
}: IngredientQuickViewProps) => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview", icon: "info" },
    {
      id: "chemical-structure",
      label: "Chemical Structure",
      icon: "biotech",
    },
    {
      id: "physical-properties",
      label: "Physical Properties",
      icon: "thermostat",
    },
    {
      id: "chemical-properties",
      label: "Chemical Properties",
      icon: "science",
    },
    {
      id: "compliance",
      label: "Compliance & Regulations",
      icon: "verified_user",
    },
    { id: "suppliers", label: "Suppliers", icon: "local_shipping" },
    { id: "documents", label: "Documents", icon: "description" },
  ];

  const handleAddToFormula = () => {
    if (ingredient) {
      eventBus.emit("add-ingredient-to-formula", {
        ingredientId: ingredient.id,
      });
      onClose();
    }
  };

  const renderSection = () => {
    if (!ingredient) return null;

    const SectionComponent = {
      overview: OverviewSection,
      "chemical-structure": ChemicalStructureSection,
      "physical-properties": PhysicalPropertiesSection,
      "chemical-properties": ChemicalPropertiesSection,
      compliance: ComplianceSection,
      suppliers: SuppliersSection,
      documents: DocumentsSection,
    }[activeSection];

    if (!SectionComponent) return null;

    return (
      <Suspense
        fallback={
          <div
            style={mergeStyles(tw("flex items-center justify-center"), {
              paddingTop: "2rem",
              paddingBottom: "2rem",
            })}
          >
            <div
              style={mergeStyles(tw("rounded-full border-blue-600"), {
                width: "1.5rem",
                height: "1.5rem",
                borderBottomWidth: "2px",
                animation: "spin 1s linear infinite",
              })}
            ></div>
          </div>
        }
      >
        <SectionComponent ingredient={ingredient} />
      </Suspense>
    );
  };

  if (!ingredient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ingredient.name}
      size="3xl"
      noPadding
      footerActions={
        <div style={tw("flex justify-end gap-2")}>
          <button
                type="button"
            onClick={onClose}
            style={tw(
              "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer"
            )}
          >
            Close
          </button>
          <Button onClick={handleAddToFormula} size="sm">
            <span
              className="material-symbols-rounded"
              style={{ marginRight: "0.5rem" }}
            >
              add
            </span>
            Add to Active Formula
          </Button>
        </div>
      }
    >
      <div style={mergeStyles(tw("flex"), { height: "100%" })}>
        {/* Vertical Sidebar Navigation */}
        <div
          style={mergeStyles(
            tw("bg-gray-50 border-r border-gray-200 flex-shrink-0"),
            { width: "16rem" }
          )}
        >
          <nav style={{ padding: "1rem" }}>
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                type="button"
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={mergeStyles(
                    tw(
                      "w-full flex items-center text-sm font-medium rounded-md cursor-pointer"
                    ),
                    {
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      paddingTop: "0.625rem",
                      paddingBottom: "0.625rem",
                      marginBottom: "0.25rem",
                      textAlign: "left",
                    },
                    isActive
                      ? mergeStyles(tw("bg-blue-100 text-blue-700"), {
                          borderLeft: "4px solid #2563eb",
                        })
                      : tw("text-gray-600")
                  )}
                >
                  <span
                    className="material-symbols-rounded"
                    style={mergeStyles(tw("text-base flex-shrink-0"), {
                      marginRight: "0.75rem",
                    })}
                  >
                    {section.icon}
                  </span>
                  <span style={tw("truncate")}>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area with consistent height and proper scrolling */}
        <div style={tw("flex-1 flex flex-col overflow-hidden")}>
          <div
            style={mergeStyles(tw("flex-1 overflow-y-auto"), {
              padding: "1.5rem",
            })}
          >
            {renderSection()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IngredientQuickView;
