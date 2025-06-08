/**
 * MainLayout.jsx
 * Composant principal qui gère la mise en page de l'application
 * Utilisé dans App.jsx pour structurer l'interface utilisateur
 */

import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../pages/Sidebar";
import SettingsPanel from "../ui/SettingsPanel";
import { AppContext } from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import AppRoutes from "../../routes/Routes";
import { ToastContainer } from "react-toastify";

function MainLayout() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);
  const { setIsDarkMode } = useContext(ThemeContext);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Vérifier si l'élément actif est un champ de saisie
      const activeElement = document.activeElement;
      const isInputField =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable;

      // Si on est dans un champ de saisie, ne pas activer les raccourcis
      if (isInputField) return;

      if (e?.key?.toLowerCase() === "l") {
        setIsDarkMode(false);
      } else if (e?.key?.toLowerCase() === "d") {
        setIsDarkMode(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsDarkMode]);

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

export default MainLayout;
