import { useEffect, useRef } from "react";

interface EditableCellProps {
  value: string | number;
  isEditing: boolean;
  isFocused: boolean;
  editValue: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClick: () => void;
  className?: string;
  align?: "left" | "right" | "center";
}

/**
 * EditableCell component for DataGrid
 *
 * Features:
 * - Focused state (blue ring) when cell is selected
 * - Editing state with hidden cursor (text selected)
 * - Keyboard navigation support
 * - Direct typing replaces existing value
 */
export const EditableCell = ({
  value,
  isEditing,
  isFocused,
  editValue,
  onChange,
  onKeyDown,
  onClick,
  className = "",
  align = "right",
}: EditableCellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSelectedRef = useRef(false);
  const previousEditingRef = useRef(isEditing);

  // Reset selection flag when editing stops
  useEffect(() => {
    if (!isEditing) {
      hasSelectedRef.current = false;
      previousEditingRef.current = false;
    }
  }, [isEditing]);

  // Focus input when cell becomes focused or starts editing
  useEffect(() => {
    if ((isFocused || isEditing) && inputRef.current) {
      inputRef.current.focus();

      // Select all text only ONCE when editing first starts
      // AND only if editValue is empty (meaning Enter/Space was pressed, not a digit typed)
      if (isEditing && !previousEditingRef.current && !hasSelectedRef.current) {
        // Only select if editValue is empty (Enter/Space pressed)
        // If editValue has content, user already typed a digit, so don't select
        if (editValue === "") {
          // Small delay to ensure the input is ready
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.select();
            }
          }, 0);
        }
        hasSelectedRef.current = true;
      }

      previousEditingRef.current = isEditing;
    }
  }, [isFocused, isEditing, editValue]);

  // Render focused/editing state
  if (isFocused || isEditing) {
    // Show editValue when editing, actual value when just focused
    const displayValue = isEditing
      ? editValue
      : typeof value === "number"
      ? value.toFixed(5)
      : String(value || "");

    return (
      <td
        className={`
          px-3 py-2 
          ${className}
          ${
            isFocused && !isEditing
              ? "bg-blue-50 ring-2 ring-inset ring-blue-200"
              : ""
          }
          ${isEditing ? "bg-blue-100 ring-2 ring-inset ring-blue-300" : ""}
        `}
        onClick={onClick}
      >
        <div className={`text-${align}`}>
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onInput={(e) => {
              // Only allow numbers, dot, and backspace
              const input = e.target as HTMLInputElement;
              const value = input.value;
              // Remove any non-numeric characters except dot
              const cleaned = value.replace(/[^0-9.]/g, "");
              // Ensure only one dot
              const parts = cleaned.split(".");
              const sanitized =
                parts.length > 2
                  ? `${parts[0]  }.${  parts.slice(1).join("")}`
                  : cleaned;
              if (value !== sanitized) {
                input.value = sanitized;
                onChange(sanitized);
              }
            }}
            readOnly={!isEditing}
            className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0"
            style={{
              caretColor: isEditing ? "transparent" : "auto",
            }}
          />
        </div>
      </td>
    );
  }

  // Render normal state
  return (
    <td
      className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={onClick}
    >
      <div className={`text-${align}`}>{value ?? ""}</div>
    </td>
  );
};
