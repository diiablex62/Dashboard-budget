/**
 * App.jsx
 * Point d'entrée principal de l'application
 * Configure les providers et le layout principal
 */

import React from "react";
import "./styles/tailwind.css";
import "react-toastify/dist/ReactToastify.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
