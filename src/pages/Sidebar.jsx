import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AiOutlineHome,
  AiOutlinePieChart,
  AiOutlineCalendar,
  AiOutlineLogin,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineBell,
  AiOutlineUser,
  AiOutlineSearch,
  AiOutlineDollarCircle,
} from "react-icons/ai";
import { MdAutorenew } from "react-icons/md";
import { ThemeContext } from "../context/ThemeContext";

// Composant pour l'icône de notification
const NotificationIcon = React.memo(({ hasUnread }) => (
  <div className='relative'>
    <AiOutlineBell className='text-2xl' />
    {hasUnread && (
      <div className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full' />
    )}
  </div>
));

// Composant pour les liens de navigation
const NavItem = React.memo(({ to, icon, label, isCollapsed, onClick }) => {
  if (onClick) {
    return (
      <button
        type='button'
        onClick={onClick}
        className={`flex items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group hover:bg-gray-50 dark:hover:bg-[#232329] text-gray-700 dark:text-gray-300 ${
          isCollapsed ? "justify-center px-4" : "justify-start px-4"
        }`}
        title={label}>
        <div className='flex items-center'>{icon}</div>
        {!isCollapsed && (
          <span className='text-base whitespace-nowrap'>{label}</span>
        )}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group ${
          isActive
            ? "bg-gray-100 dark:bg-[#18181b] text-gray-900 dark:text-white font-semibold"
            : "hover:bg-gray-50 dark:hover:bg-[#232329] text-gray-700 dark:text-gray-300"
        } ${isCollapsed ? "justify-center px-4" : "justify-start px-4"}`
      }
      title={label}>
      <div className='flex items-center'>{icon}</div>
      {!isCollapsed && (
        <span className='text-base whitespace-nowrap'>{label}</span>
      )}
    </NavLink>
  );
});

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { isAuthenticated, user, avatar } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(() => {
    const notifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
    return notifications.some((n) => !n.read);
  });

  const handleNotificationsUpdate = useCallback(() => {
    const notifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
    setHasUnreadNotifications(notifications.some((n) => !n.read));
  }, []);

  useEffect(() => {
    handleNotificationsUpdate();
    window.addEventListener("notificationsUpdated", handleNotificationsUpdate);
    return () =>
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationsUpdate
      );
  }, [handleNotificationsUpdate]);

  // Gérer le survol
  const handleMouseEnter = useCallback(() => {
    setIsCollapsed(false);
  }, [setIsCollapsed]);

  const handleMouseLeave = useCallback(() => {
    setIsCollapsed(true);
  }, [setIsCollapsed]);

  const handleSearchClick = useCallback(() => {
    if (isCollapsed) {
      searchInputRef.current?.focus();
    }
  }, [isCollapsed]);

  const overviewLinks = useMemo(
    () => [
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
        icon: <AiOutlineDollarCircle className='text-2xl' />,
        label: "Paiements échelonnés",
      },
      {
        to: "/agenda",
        icon: <AiOutlineCalendar className='text-2xl' />,
        label: "Agenda",
      },
      {
        to: "/notifications",
        icon: <NotificationIcon hasUnread={hasUnreadNotifications} />,
        label: "Notifications",
      },
    ],
    [hasUnreadNotifications]
  );

  return (
    <>
      {/* Fond arrondi sous la sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen z-10 bg-white rounded-r-3xl transition-all duration-500 ease-in-out ${
          isCollapsed ? "w-20" : "w-72"
        }`}
        aria-hidden='true'
      />
      {/* Sidebar réelle */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`h-screen fixed top-0 left-0 z-30 bg-white text-gray-800 dark:bg-black dark:text-white flex flex-col shadow-lg border-r border-gray-200 transition-all duration-500 ease-in-out rounded-r-3xl ${
          isCollapsed ? "w-20" : "w-72"
        }`}>
        {/* Bloc du haut : Logo, recherche, overview, menu */}
        <div>
          {/* Titre et recherche */}
          <div className='flex  flex-col items-center py-4 px-4 border-b border-gray-100'>
            <span className='text-3xl font-bold tracking-wide uppercase mb-8'>
              {!isCollapsed ? "Futurio" : "F"}
            </span>
            <div
              className={`flex items-center rounded-lg mb-2 ${
                isCollapsed
                  ? "justify-center w-10 h-10 hover:bg-gray-50 cursor-pointer dark:bg-[#18181b]"
                  : "w-full bg-gray-100 px-3 py-2 dark:bg-[#18181b]"
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
                  className='bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400 ml-2 dark:text-white dark:placeholder-gray-400'
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
                    <NavItem
                      to={link.to}
                      icon={link.icon}
                      label={link.label}
                      isCollapsed={isCollapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bloc du bas : Profil utilisateur */}
        <div className='mt-auto'>
          {isAuthenticated ? (
            <NavLink
              to='/profil'
              className={({ isActive }) =>
                `py-6 flex justify-center gap-3 items-center transition-all cursor-pointer group ${
                  isActive
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "hover:bg-gray-50 dark:hover:bg-[#232329] text-gray-700 dark:text-gray-300"
                }`
              }
              title='Profil utilisateur'
              tabIndex={0}>
              <div className='w-12 h-12 rounded-full flex items-center justify-center overflow-hidden'>
                {avatar ? (
                  <img
                    src={avatar}
                    alt='Avatar'
                    className='w-12 h-12 object-cover rounded-full'
                  />
                ) : (
                  <AiOutlineUser className='text-3xl text-gray-400' />
                )}
              </div>
              {!isCollapsed && (
                <div className='flex flex-col justify-center'>
                  <span className='font-semibold text-gray-800 dark:text-white'>
                    {user?.name || "Utilisateur"}
                  </span>
                  <span className='text-xs text-gray-500 dark:text-gray-500'>
                    {user?.email || ""}
                  </span>
                </div>
              )}
            </NavLink>
          ) : (
            <div className='p-4 border-t border-gray-200 dark:border-gray-800'>
              <button
                onClick={() => navigate("/auth")}
                className={`flex bg-black text-white items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group hover:bg-gray-800 ${
                  isCollapsed ? "justify-center px-4" : "justify-start px-4"
                }`}>
                <AiOutlineLogin
                  className={`text-2xl ${isCollapsed ? "animate-pulse" : ""}`}
                />
                {!isCollapsed && (
                  <span className='whitespace-nowrap'>
                    Se connecter / S'inscrire
                  </span>
                )}
              </button>
              {!isCollapsed && (
                <p className='text-xs text-center text-gray-500 mt-2'>
                  Connexion simplifiée par email, Google ou GitHub
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
