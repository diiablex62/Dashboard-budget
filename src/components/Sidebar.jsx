import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom"; // Importez useLocation
import "../styles/tailwind.css";
import { AppContext } from "../context/AppContext";
import {
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineTable,
  AiOutlineFileText,
  AiOutlineBell,
} from "react-icons/ai";
import { FaMapMarkedAlt } from "react-icons/fa";

export default function Sidebar() {
  const { sidebarType, isNavbarFixed } = useContext(AppContext);
  const location = useLocation(); // Obtenez l'URL actuelle

  // Map des titres en fonction des chemins
  const titles = {
    "/": "Dashboard",
    "/onglet1": "Onglet 1",
    "/onglet2": "Onglet 2",
    "/onglet3": "Onglet 3",
    "/onglet4": "Onglet 4",
    "/onglet5": "Onglet 5",
  };

  const activeTitle = titles[location.pathname] || "Page inconnue"; // Utilisez un titre par défaut si le chemin n'est pas trouvé

  return (
    <div
      className={`w-72 h-screen ${
        sidebarType === "transparent" ? "bg-transparent" : "bg-white"
      } text-gray-800 flex flex-col shadow-md ${isNavbarFixed ? "mt-16" : ""}`}>
      <h2 className='text-3xl font-bold p-8 border-b border-gray-200'>
        Gestion de budget {/* Titre fixe */}
      </h2>
      <nav className='flex-1'>
        <ul className='space-y-4'>
          <li
            className={`flex items-center p-4 rounded-lg cursor-pointer ${
              location.pathname === "/"
                ? "bg-gray-100 text-blue-500"
                : "hover:bg-gray-100"
            }`}>
            <Link to='/' className='flex items-center w-full'>
              <AiOutlineDashboard className='mr-6 text-2xl' />
              <span className='text-lg font-medium'>Dashboard</span>
            </Link>
          </li>
          <li
            className={`flex items-center p-4 rounded-lg cursor-pointer ${
              location.pathname === "/onglet1"
                ? "bg-gray-100 text-blue-500"
                : "hover:bg-gray-100"
            }`}>
            <Link to='/onglet1' className='flex items-center w-full'>
              <AiOutlineUser className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 1</span>
            </Link>
          </li>
          <li
            className={`flex items-center p-4 rounded-lg cursor-pointer ${
              location.pathname === "/onglet2"
                ? "bg-gray-100 text-blue-500"
                : "hover:bg-gray-100"
            }`}>
            <Link to='/onglet2' className='flex items-center w-full'>
              <AiOutlineTable className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 2</span>
            </Link>
          </li>
          <li
            className={`flex items-center p-4 rounded-lg cursor-pointer ${
              location.pathname === "/onglet3"
                ? "bg-gray-100 text-blue-500"
                : "hover:bg-gray-100"
            }`}>
            <Link to='/onglet3' className='flex items-center w-full'>
              <AiOutlineFileText className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 3</span>
            </Link>
          </li>
          <li
            className={`flex items-center p-4 rounded-lg cursor-pointer ${
              location.pathname === "/onglet4"
                ? "bg-gray-100 text-blue-500"
                : "hover:bg-gray-100"
            }`}>
            <Link to='/onglet4' className='flex items-center w-full'>
              <FaMapMarkedAlt className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 4</span>
            </Link>
          </li>
          <li
            className={`flex items-center p-4 rounded-lg cursor-pointer ${
              location.pathname === "/onglet5"
                ? "bg-gray-100 text-blue-500"
                : "hover:bg-gray-100"
            }`}>
            <Link to='/onglet5' className='flex items-center w-full'>
              <AiOutlineBell className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 5</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
