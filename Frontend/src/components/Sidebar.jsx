import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/tailwind.css";
import { AppContext } from "../context/AppContext";
import { AiOutlineCalendar, AiOutlineCreditCard } from "react-icons/ai";
import { MdSpaceDashboard, MdAutorenew } from "react-icons/md";
import { HiArrowsRightLeft } from "react-icons/hi2";

export default function Sidebar() {
  const { sidebarType, isNavbarFixed, isLoggedIn } = useContext(AppContext); // Récupérez isLoggedIn depuis le contexte
  const navigate = useNavigate();

  return (
    <div
      className={`w-72 h-screen fixed top-0 left-0 z-30 ${
        sidebarType === "transparent"
          ? "bg-transparent"
          : "bg-white dark:bg-black"
      } text-gray-800 dark:text-white flex flex-col shadow-md ${
        isNavbarFixed ? "mt-16" : ""
      }`}>
      <h2 className='text-3xl font-bold p-8 border-b border-gray-200 dark:border-gray-800'>
        Gestion de budget
      </h2>
      <nav className='flex-1'>
        <ul className='space-y-4'>
          {/* Dashboard */}
          <li>
            <NavLink
              to='/'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <MdSpaceDashboard className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Dashboard</span>
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
              <HiArrowsRightLeft
                className='mr-6 text-2xl text-[var(--primary-color)]'
                style={{ width: 24, height: 24 }}
              />
              <span className='text-lg font-medium'>Dépenses & Revenus</span>
            </NavLink>
          </li>
          {/* Paiements récurrents */}
          <li>
            <NavLink
              to='/paiements-recurrents'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <MdAutorenew className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Paiements récurrents</span>
            </NavLink>
          </li>
          {/* Paiements échelonnés */}
          <li>
            <NavLink
              to='/paiements-echelonnes'
              onClick={() => window.scrollTo(0, 0)}
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-900 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineCreditCard className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Paiements échelonnés</span>
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
              <span className='text-lg font-medium'>Agenda</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      {!isLoggedIn && (
        <div className='p-4 border-t border-gray-200'>
          <button
            className='w-full bg-[var(--primary-color)] text-white py-2 rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 cursor-pointer'
            onClick={() => navigate("/auth", { state: { isLogin: true } })}>
            Se connecter
          </button>
          <button
            className='w-full mt-4 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition duration-300 cursor-pointer'
            onClick={() => navigate("/auth", { state: { isLogin: false } })}>
            S'inscrire
          </button>
        </div>
      )}
    </div>
  );
}
