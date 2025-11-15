import { useState } from "react";
import type { Formula } from "../services/pega";
import { eventBus } from "../utils/bus";
import { tw, mergeStyles } from "../utils/tailwindToInline";
import Button from "./Button";
import Modal from "./Modal";

interface FormulaQuickViewProps {
  formula: Formula | null;
  isOpen: boolean;
  onClose: () => void;
}

const FormulaQuickView = ({
  formula,
  isOpen,
  onClose,
}: FormulaQuickViewProps) => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview", icon: "info" },
    { id: "ingredients", label: "Ingredients", icon: "inventory_2" },
    { id: "notes", label: "Fragrance Notes", icon: "air_freshener" },
  ];

  const handleAddToWorkArea = () => {
    if (formula) {
      eventBus.emit("formula-selected-for-column", { formula });
      onClose();
    }
  };

  const getStatusColor = () => {
    if (!formula) return "bg-gray-500";
    switch (formula.status) {
      case "active":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = () => {
    if (!formula) return "Unknown";
    return formula.status.charAt(0).toUpperCase() + formula.status.slice(1);
  };

  // Helper to get ingredient type badge styling
  const getIngredientTypeBadgeClass = (type: string | undefined): string => {
    if (type === "natural") return "bg-green-100 text-green-800";
    if (type === "synthetic") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const renderOverviewSection = () => {
    if (!formula) return null;

    return (
      <div style={{ marginBottom: "1.5rem" }}>
        {/* Basic Information */}
        <div>
          <h3
            style={mergeStyles(tw("text-lg font-semibold text-gray-900"), {
              marginBottom: "1rem",
            })}
          >
            Basic Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Formula ID
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900"), {
                  marginTop: "0.25rem",
                })}
              >
                {formula.id}
              </p>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Version
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900"), {
                  marginTop: "0.25rem",
                })}
              >
                {formula.version}
              </p>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Status
              </label>
              <div
                style={mergeStyles(tw("flex items-center"), {
                  marginTop: "0.25rem",
                })}
              >
                <div
                  style={mergeStyles(tw(`rounded-full ${getStatusColor()}`), {
                    width: "0.5rem",
                    height: "0.5rem",
                    marginRight: "0.5rem",
                  })}
                />
                <p style={tw("text-sm text-gray-900")}>{getStatusLabel()}</p>
              </div>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Category
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900"), {
                  marginTop: "0.25rem",
                })}
              >
                {formula.category}
              </p>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Created By
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900"), {
                  marginTop: "0.25rem",
                })}
              >
                {formula.createdBy}
              </p>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Last Updated
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900"), {
                  marginTop: "0.25rem",
                })}
              >
                {formula.lastUpdated}
              </p>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Cost per kg
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900 font-semibold"), {
                  marginTop: "0.25rem",
                })}
              >
                ${formula.costPerKg?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <label style={tw("text-sm font-medium text-gray-500")}>
                Total Percentage
              </label>
              <p
                style={mergeStyles(tw("text-sm text-gray-900"), {
                  marginTop: "0.25rem",
                })}
              >
                {formula.totalPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {formula.description && (
          <div style={{ marginTop: "1.5rem" }}>
            <h3
              style={mergeStyles(tw("text-lg font-semibold text-gray-900"), {
                marginBottom: "0.5rem",
              })}
            >
              Description
            </h3>
            <p style={tw("text-sm text-gray-600 leading-relaxed")}>
              {formula.description}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderIngredientsSection = () => {
    if (!formula || !formula.ingredients || formula.ingredients.length === 0) {
      return (
        <div
          style={mergeStyles(tw("text-center text-gray-500"), {
            paddingTop: "2rem",
            paddingBottom: "2rem",
          })}
        >
          <span
            className="material-symbols-rounded"
            style={mergeStyles(tw("text-2xl"), {
              marginBottom: "0.5rem",
              display: "block",
            })}
          >
            inventory_2
          </span>
          <p>No ingredients in this formula</p>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: "1rem" }}>
        <h3
          style={mergeStyles(tw("text-lg font-semibold text-gray-900"), {
            marginBottom: "1rem",
          })}
        >
          Ingredient List
        </h3>
        <div style={tw("overflow-hidden border border-gray-200 rounded-lg")}>
          <table style={tw("min-w-full divide-y divide-gray-200")}>
            <thead style={tw("bg-gray-50")}>
              <tr>
                <th
                  style={tw(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  )}
                >
                  Ingredient Name
                </th>
                <th
                  style={tw(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  )}
                >
                  ID
                </th>
                <th
                  style={tw(
                    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  )}
                >
                  Type
                </th>
                <th
                  style={tw(
                    "px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  )}
                >
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody style={tw("bg-white divide-y divide-gray-200")}>
              {formula.ingredients.map((ingredient, index) => (
                <tr key={index} style={tw("hover:bg-gray-50")}>
                  <td style={tw("px-4 py-3 text-sm text-gray-900")}>
                    {ingredient.name}
                  </td>
                  <td style={tw("px-4 py-3 text-sm text-gray-500")}>
                    {ingredient.ingredientId}
                  </td>
                  <td style={tw("px-4 py-3 text-sm text-gray-500")}>
                    <span
                      style={tw(
                        `inline-flex px-2 py-1 text-xs font-medium rounded-full ${getIngredientTypeBadgeClass(
                          ingredient.type
                        )}`
                      )}
                    >
                      {ingredient.type}
                    </span>
                  </td>
                  <td
                    style={tw(
                      "px-4 py-3 text-sm text-gray-900 text-right font-medium"
                    )}
                  >
                    {ingredient.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={tw("bg-gray-50")}>
              <tr>
                <td
                  colSpan={3}
                  style={tw("px-4 py-3 text-sm font-semibold text-gray-900")}
                >
                  Total
                </td>
                <td
                  style={tw(
                    "px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                  )}
                >
                  {formula.ingredients
                    .reduce((sum, ing) => sum + ing.percentage, 0)
                    .toFixed(2)}
                  %
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderNotesSection = () => {
    if (!formula || !formula.notes) {
      return (
        <div
          style={mergeStyles(tw("text-center text-gray-500"), {
            paddingTop: "2rem",
            paddingBottom: "2rem",
          })}
        >
          <span
            className="material-symbols-rounded"
            style={mergeStyles(tw("text-2xl"), {
              marginBottom: "0.5rem",
              display: "block",
            })}
          >
            air_freshener
          </span>
          <p>No fragrance notes available</p>
        </div>
      );
    }

    const { top, middle, base } = formula.notes;

    return (
      <div>
        <h3
          style={mergeStyles(tw("text-lg font-semibold text-gray-900"), {
            marginBottom: "1rem",
          })}
        >
          Fragrance Notes
        </h3>

        {/* Top Notes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={mergeStyles(tw("flex items-center"), {
              marginBottom: "0.75rem",
            })}
          >
            <div
              style={mergeStyles(tw("bg-yellow-400 rounded-full"), {
                width: "0.75rem",
                height: "0.75rem",
                marginRight: "0.5rem",
              })}
            ></div>
            <h4 style={tw("text-sm font-semibold text-gray-900")}>Top Notes</h4>
          </div>
          {top && top.length > 0 ? (
            <div style={mergeStyles(tw("flex flex-wrap"), { gap: "0.5rem" })}>
              {top.map((note, index) => (
                <span
                  key={index}
                  style={tw(
                    "inline-flex px-3 py-1 text-sm bg-yellow-50 text-yellow-800 rounded-full border border-yellow-200"
                  )}
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p style={tw("text-sm text-gray-500")}>No top notes</p>
          )}
        </div>

        {/* Middle Notes */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={mergeStyles(tw("flex items-center"), {
              marginBottom: "0.75rem",
            })}
          >
            <div
              style={mergeStyles(tw("bg-pink-400 rounded-full"), {
                width: "0.75rem",
                height: "0.75rem",
                marginRight: "0.5rem",
              })}
            ></div>
            <h4 style={tw("text-sm font-semibold text-gray-900")}>
              Middle Notes
            </h4>
          </div>
          {middle && middle.length > 0 ? (
            <div style={mergeStyles(tw("flex flex-wrap"), { gap: "0.5rem" })}>
              {middle.map((note, index) => (
                <span
                  key={index}
                  style={tw(
                    "inline-flex px-3 py-1 text-sm bg-pink-50 text-pink-800 rounded-full border border-pink-200"
                  )}
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p style={tw("text-sm text-gray-500")}>No middle notes</p>
          )}
        </div>

        {/* Base Notes */}
        <div>
          <div
            style={mergeStyles(tw("flex items-center"), {
              marginBottom: "0.75rem",
            })}
          >
            <div
              style={mergeStyles(tw("bg-purple-400 rounded-full"), {
                width: "0.75rem",
                height: "0.75rem",
                marginRight: "0.5rem",
              })}
            ></div>
            <h4 style={tw("text-sm font-semibold text-gray-900")}>
              Base Notes
            </h4>
          </div>
          {base && base.length > 0 ? (
            <div style={mergeStyles(tw("flex flex-wrap"), { gap: "0.5rem" })}>
              {base.map((note, index) => (
                <span
                  key={index}
                  style={tw(
                    "inline-flex px-3 py-1 text-sm bg-purple-50 text-purple-800 rounded-full border border-purple-200"
                  )}
                >
                  {note}
                </span>
              ))}
            </div>
          ) : (
            <p style={tw("text-sm text-gray-500")}>No base notes</p>
          )}
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverviewSection();
      case "ingredients":
        return renderIngredientsSection();
      case "notes":
        return renderNotesSection();
      default:
        return null;
    }
  };

  if (!formula) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formula.name}
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
          <Button onClick={handleAddToWorkArea} size="sm">
            <span
              className="material-symbols-rounded"
              style={{ marginRight: "0.5rem" }}
            >
              add
            </span>
            Add to Work Area
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

export default FormulaQuickView;
