/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { Toaster } from "react-hot-toast";

const Toast = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};

export default Toast;
