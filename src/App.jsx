import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./styles/tailwind.css";
import Sidebar from "./pages/Sidebar";
import SettingsPanel from "./components/ui/SettingsPanel";
import { AppContext } from "./context/AppContext";
import AppRoutes from "./routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

function AppContent() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isolatedRoutes = ["/auth"];
  const isIsolatedRoute = isolatedRoutes.includes(location.pathname);

  useEffect(() => {
    const titles = [
      "Futurio : Gestion de budget",
      "Futurio : Gérez votre budget facilement",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      document.title = titles[idx % titles.length];
      idx++;
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
  }, []);

  return (
    <div className='min-h-screen bg-gray-100'>
      {!isIsolatedRoute && (
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      )}
      <div
        className={
          isIsolatedRoute
            ? ""
            : (isCollapsed ? "ml-20" : "ml-72") +
              " relative bg-[#f8fafc] min-h-screen transition-all duration-300 ease-in-out rounded-l-3xl overflow-hidden"
        }>
        <AppRoutes />
      </div>
      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
