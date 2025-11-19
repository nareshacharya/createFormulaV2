import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

/**
 * Portal component for rendering children outside the normal DOM hierarchy.
 * Useful for modals, tooltips, and overlays.
 */
const Portal = ({ children, containerId = "portal-root" }: PortalProps) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    let portalRoot = document.getElementById(containerId);

    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.id = containerId;
      document.body.appendChild(portalRoot);
    }

    if (elRef.current) {
      const el = elRef.current;
      portalRoot.appendChild(el);

      return () => {
        portalRoot?.removeChild(el);
        if (portalRoot?.childNodes.length === 0) {
          document.body.removeChild(portalRoot);
        }
      };
    }
  }, [containerId]);

  return createPortal(children, elRef.current);
};

export default Portal;
