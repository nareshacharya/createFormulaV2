/**
 * Example components demonstrating Tailwind to Inline Styles conversion
 * These examples show different approaches for Pega-compatible styling
 */

import {
  useInteractiveStyles,
  useVariantStyles,
  useStaticStyles,
} from "../hooks/useStyles";
import { tw } from "../utils/tailwindToInline";
import { StyledDiv, StyledButton, StyledInput, StyledLabel } from "./Styled";

/**
 * Example 1: Basic usage with tw() function
 */
export function BasicExample() {
  return (
    <div style={tw("flex items-center gap-4 p-4 bg-gray-100 rounded-lg")}>
      <span style={tw("text-lg font-semibold text-gray-900")}>Hello World</span>
      <button
                type="button"
        style={tw("px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600")}
      >
        Click Me
      </button>
    </div>
  );
}

/**
 * Example 2: Using styled components with tw prop
 */
export function StyledComponentExample() {
  return (
    <StyledDiv tw="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg">
      <StyledDiv tw="text-2xl font-bold text-gray-900">
        Styled Component Example
      </StyledDiv>
      <StyledDiv tw="text-gray-600">
        This uses the StyledDiv component with tw prop
      </StyledDiv>
      <StyledButton tw="px-6 py-3 bg-green-500 text-white rounded-lg font-medium">
        Submit
      </StyledButton>
    </StyledDiv>
  );
}

/**
 * Example 3: Using hooks for static styles (with memoization)
 */
export function HookExample() {
  const containerStyles = useStaticStyles(
    "flex items-center justify-between p-4 bg-indigo-50 rounded-md"
  );
  const titleStyles = useStaticStyles("text-xl font-semibold text-indigo-900");
  const buttonStyles = useStaticStyles(
    "px-4 py-2 bg-indigo-500 text-white rounded"
  );

  return (
    <div style={containerStyles}>
      <h2 style={titleStyles}>Hook Example</h2>
      <button type="button" style={buttonStyles}>Action</button>
    </div>
  );
}

/**
 * Example 4: Interactive styles with hover/focus
 */
export function InteractiveExample() {
  const [buttonStyles, , buttonHandlers] = useInteractiveStyles(
    "px-6 py-3 bg-purple-500 text-white rounded-lg font-medium transition",
    "bg-purple-600 shadow-lg", // hover
    "ring-4 ring-purple-300" // focus
  );

  return (
    <div style={tw("flex items-center justify-center p-8")}>
      <button type="button" style={buttonStyles} {...buttonHandlers}>
        Hover or Focus Me
      </button>
    </div>
  );
}

/**
 * Example 5: Variant styles
 */
export function VariantExample({
  variant = "primary",
}: {
  variant?: "primary" | "secondary" | "danger";
}) {
  const buttonStyles = useVariantStyles(
    "px-4 py-2 rounded font-medium transition",
    {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-500 text-white hover:bg-gray-600",
      danger: "bg-red-500 text-white hover:bg-red-600",
    },
    variant
  );

  return (
    <div style={tw("flex gap-4 p-4")}>
      <button type="button" style={buttonStyles}>
        {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
      </button>
    </div>
  );
}

/**
 * Example 6: Form with inline styles
 */
export function FormExample() {
  const formStyles = useStaticStyles(
    "flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md"
  );
  const labelStyles = useStaticStyles("text-sm font-medium text-gray-700");
  const inputStyles = useStaticStyles(
    "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
  );
  const buttonStyles = useStaticStyles(
    "px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
  );

  return (
    <form style={formStyles}>
      <div style={tw("flex flex-col gap-2")}>
        <label style={labelStyles} htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          style={inputStyles}
          placeholder="Enter your name"
        />
      </div>

      <div style={tw("flex flex-col gap-2")}>
        <label style={labelStyles} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          style={inputStyles}
          placeholder="Enter your email"
        />
      </div>

      <button type="submit" style={buttonStyles}>
        Submit
      </button>
    </form>
  );
}

/**
 * Example 7: Alternative using Styled components for forms
 */
export function StyledFormExample() {
  return (
    <form>
      <StyledDiv tw="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md">
        <StyledDiv tw="flex flex-col gap-2">
          <StyledLabel
            tw="text-sm font-medium text-gray-700"
            htmlFor="username"
          >
            Username
          </StyledLabel>
          <StyledInput
            tw="px-3 py-2 border border-gray-300 rounded-md"
            id="username"
            type="text"
            placeholder="Enter username"
          />
        </StyledDiv>

        <StyledDiv tw="flex flex-col gap-2">
          <StyledLabel
            tw="text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Password
          </StyledLabel>
          <StyledInput
            tw="px-3 py-2 border border-gray-300 rounded-md"
            id="password"
            type="password"
            placeholder="Enter password"
          />
        </StyledDiv>

        <StyledButton
          tw="px-4 py-2 bg-blue-500 text-white rounded-md font-medium"
          type="submit"
        >
          Login
        </StyledButton>
      </StyledDiv>
    </form>
  );
}

/**
 * Example 8: Conditional styles
 */
export function ConditionalExample({
  isActive,
  isError,
}: {
  isActive?: boolean;
  isError?: boolean;
}) {
  // Helper to get status classes
  const getStatusClasses = (): string => {
    if (isError) return "bg-red-100 text-red-800 border border-red-300";
    if (isActive) return "bg-green-100 text-green-800 border border-green-300";
    return "bg-gray-100 text-gray-800 border border-gray-300";
  };

  // Helper to get status label
  const getStatusLabel = (): string => {
    if (isError) return "Error";
    if (isActive) return "Active";
    return "Inactive";
  };

  // Method 1: Using template literals
  const statusClasses = `px-4 py-2 rounded ${getStatusClasses()}`;

  return (
    <div style={tw("flex gap-4 p-4")}>
      <div style={tw(statusClasses)}>Status: {getStatusLabel()}</div>
    </div>
  );
}

/**
 * Example 9: Card component with all styles inline
 */
export function CardExample() {
  return (
    <StyledDiv tw="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg max-w-sm border border-gray-200">
      <StyledDiv tw="flex items-center gap-3">
        <StyledDiv tw="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
        <StyledDiv tw="flex flex-col">
          <StyledDiv tw="text-lg font-bold text-gray-900">John Doe</StyledDiv>
          <StyledDiv tw="text-sm text-gray-500">Software Engineer</StyledDiv>
        </StyledDiv>
      </StyledDiv>

      <StyledDiv tw="text-gray-700">
        Building amazing applications with inline styles for Pega compatibility.
      </StyledDiv>

      <StyledDiv tw="flex gap-2">
        <StyledButton tw="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
          Follow
        </StyledButton>
        <StyledButton tw="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">
          Message
        </StyledButton>
      </StyledDiv>
    </StyledDiv>
  );
}

/**
 * Example 10: Grid layout
 */
export function GridExample() {
  const items = [1, 2, 3, 4, 5, 6];

  return (
    <StyledDiv tw="p-6">
      <StyledDiv tw="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <StyledDiv
            key={item}
            tw="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md"
          >
            <StyledDiv tw="text-2xl font-bold">Item {item}</StyledDiv>
            <StyledDiv tw="text-sm opacity-80">Description</StyledDiv>
          </StyledDiv>
        ))}
      </StyledDiv>
    </StyledDiv>
  );
}
