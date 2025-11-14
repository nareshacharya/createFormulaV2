import { useState, useEffect } from "react";
import { tw, mergeStyles } from "../utils/tailwindToInline";

export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  combinator: "and" | "or";
  rules: (FilterRule | FilterGroup)[];
}

interface QueryBuilderProps {
  onQueryChange: (query: FilterGroup) => void;
  onApply: () => void;
  onClear: () => void;
}

const QueryBuilder = ({
  onQueryChange,
  onApply: _onApply,
  onClear,
}: QueryBuilderProps) => {
  const [query, setQuery] = useState<FilterGroup>({
    id: "root",
    combinator: "and",
    rules: [],
  });

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "code", label: "Code", type: "text" },
    { name: "price", label: "Price", type: "number" },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: ["natural", "synthetic", "nature_identical"],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ["Essential Oils", "Aroma Chemicals", "base"],
    },
    {
      name: "supplier",
      label: "Supplier",
      type: "select",
      options: ["Givaudan", "Firmenich", "IFF", "Symrise"],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["active", "inactive", "palette", "analytical", "sers_review"],
    },
    { name: "mac", label: "MAC", type: "number" },
    { name: "odorProfile", label: "Odor Profile", type: "text" },
    {
      name: "volatility",
      label: "Volatility",
      type: "select",
      options: ["top", "heart", "base"],
    },
    {
      name: "allergens",
      label: "Allergens",
      type: "multiselect",
      options: ["Limonene", "Linalool", "Citronellol", "Geraniol"],
    },
  ];

  const operators = [
    { name: "=", label: "equals" },
    { name: "!=", label: "not equals" },
    { name: "contains", label: "contains" },
    { name: "beginsWith", label: "begins with" },
    { name: "endsWith", label: "ends with" },
    { name: ">", label: "greater than" },
    { name: "<", label: "less than" },
    { name: ">=", label: "greater than or equal" },
    { name: "<=", label: "less than or equal" },
    { name: "null", label: "is null" },
    { name: "notNull", label: "is not null" },
  ];

  const addRuleToGroup = (groupId: string) => {
    const newRule: FilterRule = {
      id: `rule_${Date.now()}`,
      field: "name",
      operator: "=",
      value: "",
    };

    const addToRules = (
      rules: (FilterRule | FilterGroup)[]
    ): (FilterRule | FilterGroup)[] => {
      return rules.map((rule) => {
        if ("rules" in rule && rule.id === groupId) {
          return { ...rule, rules: [...rule.rules, newRule] };
        }
        if ("rules" in rule) {
          return { ...rule, rules: addToRules(rule.rules) };
        }
        return rule;
      });
    };

    if (groupId === "root") {
      setQuery((prev) => ({
        ...prev,
        rules: [...prev.rules, newRule],
      }));
    } else {
      setQuery((prev) => ({
        ...prev,
        rules: addToRules(prev.rules),
      }));
    }
  };

  const addGroupToGroup = (parentGroupId: string) => {
    const newGroup: FilterGroup = {
      id: `group_${Date.now()}`,
      combinator: "and",
      rules: [],
    };

    const addToRules = (
      rules: (FilterRule | FilterGroup)[]
    ): (FilterRule | FilterGroup)[] => {
      return rules.map((rule) => {
        if ("rules" in rule && rule.id === parentGroupId) {
          return { ...rule, rules: [...rule.rules, newGroup] };
        }
        if ("rules" in rule) {
          return { ...rule, rules: addToRules(rule.rules) };
        }
        return rule;
      });
    };

    if (parentGroupId === "root") {
      setQuery((prev) => ({
        ...prev,
        rules: [...prev.rules, newGroup],
      }));
    } else {
      setQuery((prev) => ({
        ...prev,
        rules: addToRules(prev.rules),
      }));
    }
  };

  const removeRule = (ruleId: string) => {
    const removeFromRules = (
      rules: (FilterRule | FilterGroup)[]
    ): (FilterRule | FilterGroup)[] => {
      return rules
        .filter((rule) => rule.id !== ruleId)
        .map((rule) => {
          if ("rules" in rule) {
            return { ...rule, rules: removeFromRules(rule.rules) };
          }
          return rule;
        });
    };

    setQuery((prev) => ({
      ...prev,
      rules: removeFromRules(prev.rules),
    }));
  };

  const updateRule = (ruleId: string, updates: Partial<FilterRule>) => {
    const updateInRules = (
      rules: (FilterRule | FilterGroup)[]
    ): (FilterRule | FilterGroup)[] => {
      return rules.map((rule) => {
        if (rule.id === ruleId && !("rules" in rule)) {
          return { ...rule, ...updates };
        }
        if ("rules" in rule) {
          return { ...rule, rules: updateInRules(rule.rules) };
        }
        return rule;
      });
    };

    setQuery((prev) => ({
      ...prev,
      rules: updateInRules(prev.rules),
    }));
  };

  const updateGroupCombinator = (groupId: string, combinator: "and" | "or") => {
    const updateInRules = (
      rules: (FilterRule | FilterGroup)[]
    ): (FilterRule | FilterGroup)[] => {
      return rules.map((rule) => {
        if (rule.id === groupId && "rules" in rule) {
          return { ...rule, combinator };
        }
        if ("rules" in rule) {
          return { ...rule, rules: updateInRules(rule.rules) };
        }
        return rule;
      });
    };

    if (groupId === "root") {
      setQuery((prev) => ({ ...prev, combinator }));
    } else {
      setQuery((prev) => ({
        ...prev,
        rules: updateInRules(prev.rules),
      }));
    }
  };

  const renderRule = (
    rule: FilterRule | FilterGroup,
    index: number,
    parentRules: (FilterRule | FilterGroup)[],
    parentCombinator: "and" | "or",
    _parentGroupId: string
  ) => {
    if ("rules" in rule) {
      // This is a group
      return (
        <div
          key={rule.id}
          style={tw("border border-gray-300 rounded p-3 bg-gray-50 ml-4")}
        >
          <div style={tw("flex items-center justify-between mb-3")}>
            <div style={tw("flex items-center space-x-2")}>
              <select
                value={rule.combinator}
                onChange={(e) =>
                  updateGroupCombinator(rule.id, e.target.value as "and" | "or")
                }
                style={tw(
                  "px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                )}
              >
                <option value="and">AND</option>
                <option value="or">OR</option>
              </select>
              <div style={tw("flex space-x-1")}>
                <button
                  onClick={() => addRuleToGroup(rule.id)}
                  style={tw(
                    "inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
                  )}
                >
                  <i
                    style={mergeStyles(tw("mr-1"))}
                    className="ri-add-line"
                  ></i>
                  Rule
                </button>
                <button
                  onClick={() => addGroupToGroup(rule.id)}
                  style={tw(
                    "inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 border border-green-200 rounded hover:bg-green-50 cursor-pointer"
                  )}
                >
                  <i
                    style={mergeStyles(tw("mr-1"))}
                    className="ri-folder-add-line"
                  ></i>
                  Group
                </button>
              </div>
            </div>
            <button
              onClick={() => removeRule(rule.id)}
              style={tw(
                "p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
              )}
            >
              <i style={tw("text-xs")} className="ri-close-line"></i>
            </button>
          </div>
          <div style={tw("space-y-2")}>
            {rule.rules.length === 0 && (
              <div style={tw("text-center py-3 text-gray-500 text-xs")}>
                No rules in this group
              </div>
            )}
            {rule.rules.map((subRule, subIndex) =>
              renderRule(
                subRule,
                subIndex,
                rule.rules,
                rule.combinator,
                rule.id
              )
            )}
          </div>
        </div>
      );
    } else {
      // This is a rule
      return (
        <div key={rule.id} style={tw("flex items-center space-x-2 text-xs")}>
          {index > 0 && (
            <span
              style={tw("px-2 py-1 bg-gray-200 rounded text-xs font-medium")}
            >
              {parentCombinator.toUpperCase()}
            </span>
          )}

          <select
            value={rule.field}
            onChange={(e) => updateRule(rule.id, { field: e.target.value })}
            style={tw(
              "px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0 w-24"
            )}
          >
            {fields.map((field) => (
              <option key={field.name} value={field.name}>
                {field.label}
              </option>
            ))}
          </select>

          <select
            value={rule.operator}
            onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
            style={tw(
              "px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0 w-28"
            )}
          >
            {operators.map((op) => (
              <option key={op.name} value={op.name}>
                {op.label}
              </option>
            ))}
          </select>

          {rule.operator !== "null" && rule.operator !== "notNull" && (
            <input
              type="text"
              value={rule.value}
              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
              placeholder="Value"
              style={tw(
                "px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-1 w-20"
              )}
            />
          )}

          <button
            onClick={() => removeRule(rule.id)}
            style={tw(
              "p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer flex-shrink-0"
            )}
          >
            <i style={tw("text-xs")} className="ri-close-line"></i>
          </button>
        </div>
      );
    }
  };

  useEffect(() => {
    onQueryChange(query);
  }, [query, onQueryChange]);

  const handleClear = () => {
    const emptyQuery = {
      id: "root",
      combinator: "and" as const,
      rules: [],
    };
    setQuery(emptyQuery);
    onClear();
  };

  return (
    <div style={tw("space-y-3")}>
      <div style={tw("space-y-2 max-h-48 overflow-y-auto")}>
        {query.rules.map((rule, index) =>
          renderRule(rule, index, query.rules, query.combinator, "root")
        )}

        {query.rules.length === 0 && (
          <div style={tw("text-center py-4 text-gray-500 text-xs")}>
            No filters added yet
          </div>
        )}
      </div>

      <div
        style={tw(
          "flex justify-between items-center pt-2 border-t border-gray-200"
        )}
      >
        <div style={tw("flex space-x-1")}>
          <button
            onClick={() => addRuleToGroup("root")}
            style={tw(
              "inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 cursor-pointer"
            )}
          >
            <i style={mergeStyles(tw("mr-1"))} className="ri-add-line"></i>Rule
          </button>
          <button
            onClick={() => addGroupToGroup("root")}
            style={tw(
              "inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 border border-green-200 rounded hover:bg-green-50 cursor-pointer"
            )}
          >
            <i
              style={mergeStyles(tw("mr-1"))}
              className="ri-folder-add-line"
            ></i>
            Group
          </button>
        </div>

        <div style={tw("flex space-x-1")}>
          <button
            onClick={handleClear}
            style={tw(
              "px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer"
            )}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryBuilder;
