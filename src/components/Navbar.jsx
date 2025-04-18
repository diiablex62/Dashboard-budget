import React, { useContext, useState } from "react";
import {
  AiOutlineSearch,
  AiOutlineSetting,
  AiOutlineBell,
  AiOutlineHome,
} from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import SettingsPanel from "./SettingsPanel"; // Import du composant SettingsPanel

export default function Navbar() {
  const { activeTitle, isNavbarFixed } = useContext(AppContext);
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // État local pour gérer l'ouverture des paramètres

  const isLoggedIn = false; // Remplacez par une logique réelle pour vérifier si l'utilisateur est connecté

  return (
    <div
      className={`w-full p-4 flex items-center justify-between ${
        isNavbarFixed ? "fixed top-0 left-0 bg-white shadow-md z-50" : ""
      }`}>
      {/* Section gauche : Navigation */}
      <div className='flex items-center space-x-2 text-gray-600'>
        <AiOutlineHome
          className='text-xl cursor-pointer'
          onClick={() => navigate("/")}
        />
        <span>/</span>
        <span className='text-lg font-medium text-gray-800'>{activeTitle}</span>
      </div>
      {/* Section droite : Recherche et icônes */}
      <div className='flex items-center space-x-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Rechercher...'
            className='border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <AiOutlineSearch className='absolute left-3 top-2.5 text-gray-400 text-lg' />
        </div>
        {isLoggedIn && (
          <>
            <FaUserCircle className='text-gray-500 text-2xl cursor-pointer' />
            <AiOutlineBell className='text-gray-500 text-2xl cursor-pointer' />
          </>
        )}
        <AiOutlineSetting
          className='text-gray-500 text-2xl cursor-pointer'
          title='Paramètres'
          onClick={() => setIsSettingsOpen(!isSettingsOpen)} // Bascule l'état des paramètres
        />
      </div>
      {/* Panneau des paramètres */}
      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}{" "}
      {/* Passe la fonction comme prop */}
    </div>
  );
}
