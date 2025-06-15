/**
 * App.jsx
 * Point d'entrée principal de l'application
 * Configure les providers et le layout principal
 */

import React from "react";
import "./styles/tailwind.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./config/google";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SynchroProvider } from "./context/SynchroContext";
import { BudgetProvider } from "./context/BudgetContext";
import MainLayout from "./components/layout/MainLayout";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider>
          <AppProvider>
            <AuthProvider>
              <SynchroProvider>
                <BudgetProvider>
                  <MainLayout />
                  <ToastContainer
                    position='top-right'
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                  />
                </BudgetProvider>
              </SynchroProvider>
            </AuthProvider>
          </AppProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
