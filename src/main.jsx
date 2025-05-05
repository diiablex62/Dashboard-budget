import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tailwind.css";
import App from "./App";

import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext"; // Importez le ThemeProvider
import { BudgetProvider } from "./context/BudgetContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppProvider>
        <BudgetProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </BudgetProvider>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
