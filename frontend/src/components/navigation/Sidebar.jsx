import React, { useState, useContext } from "react";
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
      icon: <AiOutlineBell className='text-2xl' />,
      label: "Notifications",
    },
  ];
  const settingsLinks = [
    {
      to: "/settings",
      icon: <AiOutlineSetting className='text-2xl' />,
      label: "Settings",
      onClick: (e) => {
        e.preventDefault();
        setIsSettingsOpen(true);
      },
    },
    {
      to: "/help",
      icon: <AiOutlineQuestionCircle className='text-2xl' />,
      label: "Help",
    },
  ];

  return (
    <div
      className={`h-screen fixed top-0 left-0 z-30 bg-white dark:bg-black text-gray-800 dark:text-white flex flex-col shadow-lg border-r border-gray-200 dark:border-gray-800 transition-all duration-500 ease-in-out rounded-r-3xl ${
        isCollapsed ? "w-20" : "w-72"
      }`}>
      {/* Titre et recherche */}
      <div className='flex flex-col items-center py-4 px-4 border-b border-gray-100 dark:border-gray-800'>
        <span className='text-3xl font-bold tracking-wide uppercase mb-8 dark:text-white'>
          {!isCollapsed ? "Futurio" : "F"}
        </span>
        <div
          className={`flex items-center rounded-lg mb-2 ${
            isCollapsed
              ? "justify-center w-10 h-10 bg-gray-100 dark:bg-gray-900"
              : "w-full bg-gray-100 dark:bg-gray-900 px-3 py-2"
          }`}>
          <AiOutlineSearch className='text-gray-400 text-lg' />
          {!isCollapsed && (
            <input
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='bg-transparent outline-none w-full text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ml-2'
            />
          )}
        </div>
      </div>

      {/* Encoche absolue débordante du sidebar */}
      <div
        className='absolute top-8 z-40'
        style={{
          right: "-20px",
          transition: "right 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='w-5 h-14 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-r-2xl cursor-pointer flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 ease-in-out shadow'
          style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.10)" }}>
          {isCollapsed ? (
            <AiOutlineRight size={15} />
          ) : (
            <AiOutlineLeft size={15} />
          )}
        </div>
      </div>

      {/* Sidebar principal */}
      <div className='flex flex-col items-stretch py-4 px-4 border-b border-gray-100 dark:border-gray-800'>
        {/* OVERVIEW */}
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
                        ? "bg-gray-100 dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
                    } ${
                      isCollapsed ? "justify-center px-4" : "justify-start px-4"
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

        {/* SETTINGS */}
        <div className='px-2 pb-2 text-left mt-8 border-t border-gray-100 dark:border-gray-800 pt-4'>
          {!isCollapsed && (
            <div className='text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 ml-2 tracking-widest'>
              SETTINGS
            </div>
          )}
          <ul className='space-y-1 mb-4'>
            {settingsLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-3 rounded-xl transition-all cursor-pointer group ${
                      isActive
                        ? "bg-gray-100 dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-bold"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200"
                    } ${
                      isCollapsed ? "justify-center px-4" : "justify-start px-4"
                    }`
                  }
                  title={link.label}
                  onClick={link.onClick}>
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

        {/* Profil utilisateur simulé */}
        <div className='mt-auto px-4 py-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3'>
          <div className='w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden'>
            <AiOutlineUser className='text-3xl text-gray-400 dark:text-gray-500' />
          </div>
          {!isCollapsed && (
            <div className='flex flex-col'>
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
  );
}
