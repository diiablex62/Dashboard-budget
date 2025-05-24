import React, { useContext, useEffect, useState } from "react";
import { AiOutlineBell, AiOutlineHome, AiOutlineSetting } from "react-icons/ai";
import { FiSun, FiMoon } from "react-icons/fi";
import { AppContext } from "../../context/AppContext";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsPanel from "../ui/SettingsPanel";

// Mapping route -> titre
const ROUTE_TITLES = {
  "/depenses-revenus": "Revenus et dépenses",
  "/dashboard": "Dashboard",
  "/recurrents": "Paiements récurrents",
  "/echelonne": "Paiements échelonnés",
  "/agenda": "Mon agenda",
  "/notifications": "Notifications",
};

function getUnreadCount() {
  try {
    const notifs = JSON.parse(localStorage.getItem("notifications"));
    if (Array.isArray(notifs)) {
      return notifs.filter((n) => !n.read).length;
    }
  } catch {}
  return 0;
}

export default function Navbar() {
  const { isSettingsOpen, setIsSettingsOpen } = useContext(AppContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Détermination du titre courant
  const currentTitle = ROUTE_TITLES[location.pathname] || "";

  const [unreadCount, setUnreadCount] = useState(getUnreadCount());
  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadCount(getUnreadCount());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

          <div className='flex items-center gap-2'>
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

            <div className='flex items-center'>
              <button
                onClick={() => navigate("/notifications")}
                className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 relative'>
                <AiOutlineBell className='h-6 w-6' />
                {unreadCount > 0 && (
                  <span className='absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 dark:bg-red-400 border-2 border-white dark:border-black'></span>
                )}
              </button>
            </div>

            <div className='flex items-center'>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                <AiOutlineSetting className='h-6 w-6' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}
    </nav>
  );
}
