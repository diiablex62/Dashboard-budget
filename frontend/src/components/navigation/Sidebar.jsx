import React, { useState, useContext, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AiOutlineHome,
  AiOutlinePieChart,
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineLogin,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineBell,
  AiOutlineUser,
  AiOutlineQuestionCircle,
  AiOutlineSearch,
} from "react-icons/ai";
import { MdAutorenew } from "react-icons/md";
import { AppContext } from "../../context/AppContext";
import SettingsPanel from "../ui/SettingsPanel";
import { ThemeContext } from "../../context/ThemeContext";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { loading } = useAuth();
  const [search, setSearch] = useState("");
  const { setIsSettingsOpen } = useContext(AppContext);
  const searchInputRef = useRef(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(() => {
    const notifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
    return notifications.some((n) => !n.read);
  });

  // Mettre à jour l'état des notifications non lues quand les notifications changent
  React.useEffect(() => {
    const handleNotificationsUpdate = () => {
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      setHasUnreadNotifications(notifications.some((n) => !n.read));
    };

    // Vérifier l'état initial
    handleNotificationsUpdate();

    // Écouter les changements
    window.addEventListener("notificationsUpdated", handleNotificationsUpdate);
    return () =>
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdate
      );
  }, []);

  const handleSearchClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  if (loading) return null;

  const overviewLinks = [
    {
      to: "/dashboard",
      icon: <AiOutlineHome className='text-2xl' />,
      label: "Dashboard",
    },
    {
      to: "/depenses-revenus",
      icon: <AiOutlinePieChart className='text-2xl' />,
      label: "Dépenses & Revenus",
    },
    {
      to: "/recurrents",
      icon: <MdAutorenew className='text-2xl' />,
      label: "Paiements récurrents",
    },
    {
      to: "/echelonne",
      icon: <AiOutlineSetting className='text-2xl' />,
      label: "Paiements échelonnés",
    },
    {
      to: "/agenda",
      icon: <AiOutlineCalendar className='text-2xl' />,
      label: "Agenda",
    },
    {
      to: "/notifications",
      icon: (
        <div className='relative'>
          <AiOutlineBell className='text-2xl' />
          {hasUnreadNotifications && (
            <div className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full' />
          )}
        </div>
      ),
      label: "Notifications",
    },
  ];

  const settingsLinks = [
    {
      key: "settings-panel",
      icon: <AiOutlineSetting className='text-2xl' />,
      label: "Paramètres",
      onClick: () => setIsSettingsOpen(true),
    },
    {
      to: "/help",
      icon: <AiOutlineQuestionCircle className='text-2xl' />,
      label: "Aide",
    },
  ];

  return (
    <>
      {/* Fond arrondi sous la sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-10 bg-white dark:bg-black rounded-r-3xl transition-all duration-500 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        }`}
        aria-hidden='true'
      />
      {/* Sidebar réelle */}
      <div
        className={`h-screen fixed top-0 left-0 z-30 bg-white dark:bg-black text-gray-800 dark:text-white flex flex-col shadow-lg border-r border-gray-200 dark:border-gray-800 transition-all duration-500 ease-in-out rounded-r-3xl ${
          isCollapsed ? "w-20" : "w-72"
        }`}>
        {/* Bouton de toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='absolute -right-5 top-6 w-5 h-12 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors z-40 flex items-center justify-center rounded-r-md'>
          {isCollapsed ? (
            <AiOutlineRight className='text-gray-600 dark:text-gray-300' />
          ) : (
            <AiOutlineLeft className='text-gray-600 dark:text-gray-300' />
          )}
        </button>

        {/* Bloc du haut : Logo, recherche, overview, menu */}
        <div>
          {/* Titre et recherche */}
          <div className='flex flex-col items-center py-4 px-4 border-b border-gray-100 dark:border-gray-800'>
            <span className='text-3xl font-bold tracking-wide uppercase mb-8 dark:text-white'>
              {!isCollapsed ? "Futurio" : "F"}
            </span>
            <div
              className={`flex items-center rounded-lg mb-2 ${
                isCollapsed
                  ? "justify-center w-10 h-10 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  : "w-full bg-gray-100 dark:bg-gray-900 px-3 py-2"
              }`}
              onClick={handleSearchClick}>
              <AiOutlineSearch
                className={`text-gray-400 ${
                  isCollapsed ? "text-2xl" : "text-lg"
                }`}
              />
              {!isCollapsed && (
                <input
                  ref={searchInputRef}
                  placeholder='Rechercher un montant...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='bg-transparent outline-none w-full text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ml-2'
                />
              )}
            </div>
          </div>

          {/* Sidebar principal (overview + menu) */}
          <div className='flex flex-col items-stretch py-4 px-4'>
            <div className={`flex-1 px-2 ${isCollapsed ? "pt-8" : "pt-4"}`}>
              {!isCollapsed && (
                <div className='text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 ml-2 tracking-widest'>
                  OVERVIEW
                </div>
              )}
              <ul className='space-y-1'>
                {overviewLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                            : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
                        } ${
                          isCollapsed
                            ? "justify-center px-4"
                            : "justify-start px-4"
                        }`
                      }
                      title={link.label}>
                      <div className='flex items-center'>{link.icon}</div>
                      {!isCollapsed && (
                        <span className='text-base whitespace-nowrap'>
                          {link.label}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bloc du bas : Paramètres, Aide, Profil utilisateur */}
        <div className='mt-auto flex flex-col border-t border-gray-100 dark:border-gray-800'>
          <div className='px-2 pb-2 text-left mt-8 pt-4'>
            {!isCollapsed && (
              <div className='text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 ml-2 tracking-widest'>
                PARAMÈTRES
              </div>
            )}
            <ul className='space-y-1 mb-4'>
              {settingsLinks.map((link) => (
                <li key={link.to || link.key}>
                  {link.key === "settings-panel" ? (
                    <button
                      type='button'
                      onClick={link.onClick}
                      className={`flex items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group w-full text-left ${"hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"} ${
                        isCollapsed
                          ? "justify-center px-4"
                          : "justify-start px-4"
                      }`}>
                      <div className='flex items-center'>{link.icon}</div>
                      {!isCollapsed && (
                        <span className='text-base whitespace-nowrap'>
                          {link.label}
                        </span>
                      )}
                    </button>
                  ) : (
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group ${
                          isActive
                            ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                            : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
                        } ${
                          isCollapsed
                            ? "justify-center px-4"
                            : "justify-start px-4"
                        }`
                      }
                      title={link.label}>
                      <div className='flex items-center'>{link.icon}</div>
                      {!isCollapsed && (
                        <span className='text-base whitespace-nowrap'>
                          {link.label}
                        </span>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className='py-6 flex justify-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden'>
              <AiOutlineUser className='text-3xl text-gray-400 dark:text-gray-500' />
            </div>
            {!isCollapsed && (
              <div className='flex flex-col justify-center'>
                <span className='font-semibold text-gray-800 dark:text-white'>
                  Alexandre Janacek
                </span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  alexandre.janacek@gmail.com
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
