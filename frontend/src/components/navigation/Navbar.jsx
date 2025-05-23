import React, { useContext } from "react";
import { AiOutlineBell, AiOutlineHome } from "react-icons/ai";
import { FiSun, FiMoon } from "react-icons/fi";
import { AppContext } from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsPanel from "../ui/SettingsPanel";
import Google from "../icones/Google";
import GitHub from "../icones/GitHub";
import NotificationBell from "../icones/NotificationBell";

// Mapping route -> titre
const ROUTE_TITLES = {
  "/depenses-revenus": "Revenus et dépenses",
  "/dashboard": "Dashboard",
  "/recurrents": "Paiements récurrents",
  "/echelonne": "Paiements échelonnés",
  "/agenda": "Mon agenda",
};

export default function Navbar() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Détermination du titre courant
  const currentTitle = ROUTE_TITLES[location.pathname] || "";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className='bg-white dark:bg-black shadow-md border-b border-gray-200 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16 items-center'>
          {/* Breadcrumb centré */}
          <div className='flex-1 flex items-center'>
            <button
              onClick={() => navigate("/dashboard")}
              className='text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 flex items-center'>
              <AiOutlineHome className='h-6 w-6' />
            </button>
            <span className='mx-2 text-gray-400'>/</span>
            <span className='text-lg font-semibold text-gray-800 dark:text-white'>
              {currentTitle}
            </span>
          </div>

          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <button
                onClick={toggleDarkMode}
                className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                {isDarkMode ? (
                  <FiSun className='h-6 w-6' />
                ) : (
                  <FiMoon className='h-6 w-6' />
                )}
              </button>
            </div>

            {user && (
              <>
                <div className='ml-4 flex items-center'>
                  <NotificationBell />
                </div>

                <div className='ml-4 flex items-center'>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                    <AiOutlineBell className='h-6 w-6' />
                  </button>
                </div>

                <div className='ml-4 flex items-center'>
                  <button
                    onClick={handleLogout}
                    className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}
    </nav>
  );
}
