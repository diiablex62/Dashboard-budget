import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/tailwind.css";
import { AppContext } from "../context/AppContext";
import {
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineTable,
  AiOutlineFileText,
  AiOutlineBell,
  AiOutlineSetting,
} from "react-icons/ai";
import { FaMapMarkedAlt } from "react-icons/fa";

export default function Sidebar() {
  const { sidebarType, isNavbarFixed, isLoggedIn } = useContext(AppContext); // Récupérez isLoggedIn depuis le contexte
  const navigate = useNavigate();

  return (
    <div
      className={`w-72 h-screen ${
        sidebarType === "transparent" ? "bg-transparent" : "bg-white"
      } text-gray-800 flex flex-col shadow-md ${isNavbarFixed ? "mt-16" : ""}`}>
      <h2 className='text-3xl font-bold p-8 border-b border-gray-200'>
        Gestion de budget
      </h2>
      <nav className='flex-1'>
        <ul className='space-y-4'>
          <li>
            <NavLink
              to='/'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineDashboard className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet1'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineUser className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Onglet 1</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet2'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineTable className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Onglet 2</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet3'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineFileText className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Onglet 3</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet4'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <FaMapMarkedAlt className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Onglet 4</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet5'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive
                    ? "bg-gray-100 text-[var(--primary-color)] font-bold"
                    : "hover:text-[var(--primary-color)]"
                }`
              }>
              <AiOutlineBell className='mr-6 text-2xl text-[var(--primary-color)]' />
              <span className='text-lg font-medium'>Onglet 5</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      {!isLoggedIn && ( // Affiche les boutons uniquement si l'utilisateur n'est pas connecté
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
