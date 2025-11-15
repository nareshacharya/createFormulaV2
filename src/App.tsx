import {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import Toast from "./components/Toast";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AppRoutes } from "./router";

// ============================================================================
// BUILD-TOOL AGNOSTIC BASE PATH DETECTION
// ============================================================================

/**
 * Extended Window interface to include build-tool injected variables
 */
interface WindowExtended extends Window {
  __BASE_PATH__?: string;
}

/**
 * Safely detect the base path for React Router
 * Supports:
 * - Storybook: iframe.html detection
 * - Vite: import.meta.env.BASE_URL
 * - Webpack 5: process.env.PUBLIC_URL or __BASE_PATH__
 * - Pega DX: window.__BASE_PATH__
 * - Browser/Other: Falls back to '/'
 *
 * @returns The base path for React Router
 */
const getBasePath = (): string => {
  // Check if running in Storybook iframe
  try {
    if (
      typeof window !== "undefined" &&
      window.location.pathname.includes("iframe.html")
    ) {
      // eslint-disable-next-line no-console
      console.debug("[App] Storybook environment detected, using '/'");
      return "/";
    }
  } catch (e) {
    // Ignore errors checking window.location
  }

  // Try Vite first (import.meta.env.BASE_URL)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) {
      // Normalize the path - remove trailing slash
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
      // eslint-disable-next-line no-console
      console.debug("[App] Base path detected: Vite", {
        basePath,
      });
      return basePath;
    }
  } catch (e) {
    // import.meta might not be available in some build contexts
  }

  // Try Webpack/CommonJS environment variables
  try {
    if (typeof process !== "undefined" && process.env?.PUBLIC_URL) {
      // Normalize the path - handle relative paths like "." or "./" and remove trailing slash
      let publicUrl = process.env.PUBLIC_URL;
      if (publicUrl === "." || publicUrl === "./") {
        publicUrl = "/";
      } else {
        publicUrl = publicUrl.replace(/\/$/, "") || "/";
      }
      // eslint-disable-next-line no-console
      console.debug("[App] Base path detected: Webpack PUBLIC_URL", {
        basePath: publicUrl,
      });
      return publicUrl;
    }
  } catch (e) {
    // process might not be available in browser contexts
  }

  // Try global __BASE_PATH__ (can be set by any build tool or manually)
  try {
    const globalWindow =
      typeof window !== "undefined" ? (window as WindowExtended) : undefined;
    if (globalWindow?.__BASE_PATH__) {
      // eslint-disable-next-line no-console
      console.debug("[App] Base path detected: window.__BASE_PATH__", {
        basePath: globalWindow.__BASE_PATH__,
      });
      return globalWindow.__BASE_PATH__;
    }
  } catch (e) {
    // window might not be available in non-browser contexts
  }

  // Default to '/' for safety
  // eslint-disable-next-line no-console
  console.warn('[App] Could not detect base path, defaulting to "/"');
  return "/";
};

// Get base path at module load time
const BASE_PATH = getBasePath();

// ============================================================================
// STORYBOOK DETECTION AND ROUTER SELECTION
// ============================================================================

/**
 * Detect if running in Storybook iframe
 * Storybook uses hash-based routing for iframes, while production uses path-based
 */
const isStorybook =
  typeof window !== "undefined" &&
  window.location.pathname.includes("iframe.html");

/**
 * Select appropriate router based on environment
 * - Storybook: Uses HashRouter (hash-based routing with #/)
 * - Production: Uses BrowserRouter (path-based routing)
 */
const Router = isStorybook ? HashRouter : BrowserRouter;

// ============================================================================
// MODAL CONTEXT FOR GLOBAL MODAL MANAGEMENT
// ============================================================================

// Modal Context for global modal management
interface ModalContextType {
  showModal: (content: React.ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

/**
 * Main App Component
 *
 * Initialization for all environments:
 *
 * 1. VITE (Development):
 *    - Base path: import.meta.env.BASE_URL (auto-detected)
 *    - No additional setup needed
 *
 * 2. WEBPACK 5 (Pega DX):
 *    In your Pega component or index.html, set BEFORE loading React:
 *    ```html
 *    <script>
 *      window.__BASE_PATH__ = '/your-pega-path/'; // or process.env.PUBLIC_URL
 *    </script>
 *    ```
 *
 * 3. BROWSER/OTHER:
 *    - Falls back to '/' automatically
 */
function App() {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );

  const showModal = useCallback((content: React.ReactNode) => {
    setModalContent(content);
  }, []);

  const hideModal = useCallback(() => {
    setModalContent(null);
  }, []);

  const contextValue = useMemo(
    () => ({ showModal, hideModal }),
    [showModal, hideModal]
  );

  return (
    <Router basename={isStorybook ? undefined : BASE_PATH}>
      <FeatureFlagsProvider>
        <WorkspaceProvider>
          <ModalContext.Provider value={contextValue}>
            <Toast />
            <AppRoutes />

            {/* Global Modal Portal */}
            {modalContent}
          </ModalContext.Provider>
        </WorkspaceProvider>
      </FeatureFlagsProvider>
    </Router>
  );
}

export default App;
