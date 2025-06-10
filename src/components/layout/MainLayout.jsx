/**
 * MainLayout.jsx
 * Composant principal qui gère la mise en page de l'application
 * Utilisé dans App.jsx pour structurer l'interface utilisateur
 */

import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../pages/Sidebar";
import SettingsPanel from "../ui/SettingsPanel";
import { AppContext } from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import AppRoutes from "../../routes/Routes";
import { ToastContainer } from "react-toastify";
import { useKeyboardShortcuts } from "../../utils/keyboardShortcuts";
import KeyboardShortcutsModal from "../ui/KeyboardShortcutsModal";

function MainLayout() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);
  const { setIsDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // Utilisation du hook de raccourcis clavier
  useKeyboardShortcuts({
    onDashboard: () => navigate("/"),
    onDepensesRevenus: () => navigate("/depenses-revenus"),
    onPaiementsRecurrents: () => navigate("/recurrents"),
    onPaiementsEchelonnes: () => navigate("/echelonne"),
    onPrevisionnel: () => navigate("/previsionnel"),
    onAgenda: () => navigate("/agenda"),
    onNotifications: () => navigate("/notifications"),
    onProfil: () => navigate("/profil"),
    onLightMode: () => setIsDarkMode(false),
    onDarkMode: () => setIsDarkMode(true),
    onHelp: () => setShowShortcuts(true),
    onSearch: () => {
      const input = document.getElementById("search-bar");
      if (input) input.focus();
    },
  });

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
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
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

export default MainLayout;
