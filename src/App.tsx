import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { useState, createContext, useContext } from "react";
import Toast from "./components/Toast";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { FeatureFlagsProvider } from "./context/FeatureFlagsContext";

// Modal Context for global modal management
interface ModalContextType {
  showModal: (content: React.ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};

function App() {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null
  );

  const showModal = (content: React.ReactNode) => {
    setModalContent(content);
  };

  const hideModal = () => {
    setModalContent(null);
  };

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <FeatureFlagsProvider>
        <WorkspaceProvider>
          <ModalContext.Provider value={{ showModal, hideModal }}>
            <Toast />
            <AppRoutes />

            {/* Global Modal Portal */}
            {modalContent}
          </ModalContext.Provider>
        </WorkspaceProvider>
      </FeatureFlagsProvider>
    </BrowserRouter>
  );
}

export default App;
