import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Importez BrowserRouter
import "./styles/tailwind.css";
import App from "./App";

import { AppProvider } from "./context/AppContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        {" "}
        {/* Enveloppez App dans BrowserRouter */}
        <App />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
