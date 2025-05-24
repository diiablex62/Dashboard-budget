import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  AiOutlineHome,
  AiOutlinePieChart,
  AiOutlineCalendar,
  AiOutlineSetting,
  AiOutlineLogin,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import { MdAutorenew } from "react-icons/md";
import { AppContext } from "../../context/AppContext";
import SettingsPanel from "../ui/SettingsPanel";
import { ThemeContext } from "../../context/ThemeContext";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Ne rien afficher pendant le chargement
  if (loading) {
    return null;
  }

  return (
    <div
      className={`h-screen fixed top-0 left-0 z-30 bg-white dark:bg-black text-gray-800 dark:text-white flex flex-col shadow-md border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}>
      {/* Encoche */}
      <div className='absolute left-full top-8 w-6 h-12 flex items-center justify-center'>
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='w-6 h-12 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-r-lg cursor-pointer flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors'>
          {isCollapsed ? (
            <AiOutlineRight size={16} />
          ) : (
            <AiOutlineLeft size={16} />
          )}
        </div>
      </div>

      <div className='relative'>
        <h2 className='text-3xl font-bold p-8 uppercase text-center'>
          {isCollapsed ? "F" : "Futurio"}
        </h2>
      </div>

      <nav className='flex-1'>
        <ul className='space-y-4'>
          {/* Dashboard */}
          <li>
            <NavLink
              to='/dashboard'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineHome className='mr-6 text-2xl text-[var(--primary-color)]' />
              {!isCollapsed && (
                <span className='text-lg font-medium'>Dashboard</span>
              )}
            </NavLink>
          </li>
          {/* Dépenses & Revenus */}
          <li>
            <NavLink
              to='/depenses-revenus'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlinePieChart className='mr-6 text-2xl text-[var(--primary-color)]' />
              {!isCollapsed && (
                <span className='text-lg font-medium'>Dépenses & Revenus</span>
              )}
            </NavLink>
          </li>
          {/* Paiements récurrents */}
          <li>
            <NavLink
              to='/recurrents'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <MdAutorenew className='mr-6 text-2xl text-[var(--primary-color)]' />
              {!isCollapsed && (
                <span className='text-lg font-medium'>
                  Paiements récurrents
                </span>
              )}
            </NavLink>
          </li>
          {/* Paiements échelonnés */}
          <li>
            <NavLink
              to='/echelonne'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineSetting className='mr-6 text-2xl text-[var(--primary-color)]' />
              {!isCollapsed && (
                <span className='text-lg font-medium'>
                  Paiements échelonnés
                </span>
              )}
            </NavLink>
          </li>
          {/* Agenda */}
          <li>
            <NavLink
              to='/agenda'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineCalendar className='mr-6 text-2xl text-[var(--primary-color)]' />
              {!isCollapsed && (
                <span className='text-lg font-medium'>Agenda</span>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>
      {!user && !isCollapsed && (
        <div className='p-4 border-t border-gray-200 dark:border-gray-800'>
          <button
            className='w-full bg-[var(--primary-color)] text-white py-3 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer flex items-center justify-center'
            onClick={() => navigate("/auth")}>
            <AiOutlineLogin className='mr-2 text-xl' />
            <span>Se connecter / S'inscrire</span>
          </button>
          <p className='text-xs text-center text-gray-500 mt-2'>
            Connexion simplifiée par email, Google ou GitHub
          </p>
        </div>
      )}
    </div>
  );
}
