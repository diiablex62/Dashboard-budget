import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Importez NavLink
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
  const { sidebarType, isNavbarFixed } = useContext(AppContext);
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
                  isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100"
                }`
              }>
              <AiOutlineDashboard className='mr-6 text-2xl' />
              <span className='text-lg font-medium'>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet1'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100"
                }`
              }>
              <AiOutlineUser className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 1</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet2'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100"
                }`
              }>
              <AiOutlineTable className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 2</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet3'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100"
                }`
              }>
              <AiOutlineFileText className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 3</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet4'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100"
                }`
              }>
              <FaMapMarkedAlt className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 4</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to='/onglet5'
              className={({ isActive }) =>
                `flex items-center p-4 rounded-lg cursor-pointer ${
                  isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100"
                }`
              }>
              <AiOutlineBell className='mr-6 text-2xl text-gray-600' />
              <span className='text-lg font-medium'>Onglet 5</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
