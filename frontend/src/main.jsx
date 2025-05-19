import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tailwind.css";
import App from "./App";
import { Analytics } from "@vercel/analytics/react";

import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BudgetProvider } from "./context/BudgetContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppProvider>
        <AuthProvider>
          <BudgetProvider>
            <BrowserRouter>
              <App />
              <Analytics />
            </BrowserRouter>
          </BudgetProvider>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
