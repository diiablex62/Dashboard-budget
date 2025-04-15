import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import App from "./App";
import { AppProvider } from "./context/AppContext"; // Importez le contexte

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider> {/* Enveloppez l'application avec AppProvider */}
      <App />
    </AppProvider>
  </React.StrictMode>
);
