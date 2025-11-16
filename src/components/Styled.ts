/**
 * Styled wrapper components for common HTML elements
 * These components accept Tailwind class names via `tw` prop and convert to inline styles
 */

import {
  forwardRef,
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { tw } from "../utils/tailwindToInline";

interface BaseStyledProps {
  tw?: string;
  children?: ReactNode;
}

/**
 * Generic styled component factory
 */
function createStyledComponent<T extends ElementType>(element: T) {
  const StyledComponent = forwardRef<
    ElementType extends T ? Element : ComponentPropsWithoutRef<T>,
    BaseStyledProps & Omit<ComponentPropsWithoutRef<T>, "className" | "style">
  >(({ tw: twClasses, style, children, ...props }, ref) => {
    const inlineStyles = twClasses ? tw(twClasses) : {};
    const mergedStyles = { ...inlineStyles, ...style };

    return createElement(
      element,
      { ...props, style: mergedStyles, ref },
      children
    );
  });

  StyledComponent.displayName = `Styled(${
    typeof element === "string" ? element : element.name || "Component"
  })`;

  return StyledComponent;
}

/**
 * Common styled components
 */
export const StyledDiv = createStyledComponent("div");
export const StyledSpan = createStyledComponent("span");
export const StyledButton = createStyledComponent("button");
export const StyledInput = createStyledComponent("input");
export const StyledLabel = createStyledComponent("label");
export const StyledP = createStyledComponent("p");
export const StyledH1 = createStyledComponent("h1");
export const StyledH2 = createStyledComponent("h2");
export const StyledH3 = createStyledComponent("h3");
export const StyledH4 = createStyledComponent("h4");
export const StyledH5 = createStyledComponent("h5");
export const StyledH6 = createStyledComponent("h6");
export const StyledSection = createStyledComponent("section");
export const StyledHeader = createStyledComponent("header");
export const StyledFooter = createStyledComponent("footer");
export const StyledNav = createStyledComponent("nav");
export const StyledAside = createStyledComponent("aside");
export const StyledMain = createStyledComponent("main");
export const StyledArticle = createStyledComponent("article");
export const StyledUl = createStyledComponent("ul");
export const StyledOl = createStyledComponent("ol");
export const StyledLi = createStyledComponent("li");
export const StyledForm = createStyledComponent("form");
export const StyledTable = createStyledComponent("table");
export const StyledThead = createStyledComponent("thead");
export const StyledTbody = createStyledComponent("tbody");
export const StyledTfoot = createStyledComponent("tfoot");
export const StyledTr = createStyledComponent("tr");
export const StyledTh = createStyledComponent("th");
export const StyledTd = createStyledComponent("td");
export const StyledTextarea = createStyledComponent("textarea");
export const StyledSelect = createStyledComponent("select");
export const StyledOption = createStyledComponent("option");
export const StyledA = createStyledComponent("a");
export const StyledImg = createStyledComponent("img");

/**
 * Export factory for custom elements
 */
export { createStyledComponent };
