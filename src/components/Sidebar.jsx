import React, { useContext } from "react";
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
  const { sidebarType, setActiveTitle, isNavbarFixed } = useContext(AppContext); // Utilisez le contexte pour obtenir le type de barre latérale et vérifier si la Navbar est fixe

  return (
    <div
      className={`w-72 h-screen ${
        sidebarType === "transparent" ? "bg-transparent" : "bg-white"
      } text-gray-800 flex flex-col shadow-md ${
        isNavbarFixed ? "mt-16" : "" // Ajoutez un margin-top si la Navbar est fixe
      }`}>
      <h2 className='text-3xl font-bold p-8 border-b border-gray-200'>
        Mon budget
      </h2>
      <nav className='flex-1'>
        <ul className='space-y-4'>
          <li
            className='flex items-center p-4 bg-gray-100 rounded-lg cursor-pointer text-blue-500'
            onClick={() => setActiveTitle("Dashboard")}>
            <AiOutlineDashboard className='mr-6 text-2xl' />
            <span className='text-lg font-medium'>Dashboard</span>
          </li>
          <li
            className='flex items-center p-4 hover:bg-gray-100 rounded-lg cursor-pointer'
            onClick={() => setActiveTitle("User Profile")}>
            <AiOutlineUser className='mr-6 text-2xl text-gray-600' />
            <span className='text-lg font-medium'>User Profile</span>
          </li>
          <li
            className='flex items-center p-4 hover:bg-gray-100 rounded-lg cursor-pointer'
            onClick={() => setActiveTitle("Table List")}>
            <AiOutlineTable className='mr-6 text-2xl text-gray-600' />
            <span className='text-lg font-medium'>Table List</span>
          </li>
          <li
            className='flex items-center p-4 hover:bg-gray-100 rounded-lg cursor-pointer'
            onClick={() => setActiveTitle("Typography")}>
            <AiOutlineFileText className='mr-6 text-2xl text-gray-600' />
            <span className='text-lg font-medium'>Typography</span>
          </li>
          <li
            className='flex items-center p-4 hover:bg-gray-100 rounded-lg cursor-pointer'
            onClick={() => setActiveTitle("Maps")}>
            <FaMapMarkedAlt className='mr-6 text-2xl text-gray-600' />
            <span className='text-lg font-medium'>Maps</span>
          </li>
          <li
            className='flex items-center p-4 hover:bg-gray-100 rounded-lg cursor-pointer'
            onClick={() => setActiveTitle("Notifications")}>
            <AiOutlineBell className='mr-6 text-2xl text-gray-600' />
            <span className='text-lg font-medium'>Notifications</span>
          </li>
        </ul>
      </nav>
    </div>
  );
}
