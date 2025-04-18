import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/tailwind.css";
import App from "./App";

import { AppProvider } from "./context/AppContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        {" "}
        <App />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>
);
