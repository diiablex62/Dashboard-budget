import React, { useContext, useState } from "react";
import { AiOutlineSetting, AiOutlineBell, AiOutlineHome } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import SettingsPanel from "./SettingsPanel"; // Import du composant SettingsPanel

export default function Navbar() {
  const { activeTitle, isNavbarFixed, primaryColor } = useContext(AppContext); // Ajout de la couleur principale
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // État local pour gérer l'ouverture des paramètres
  const [searchText, setSearchText] = useState(""); // État local pour le texte de recherche

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
        <div className='relative flex-1 max-w-md'>
          <input
            type='text'
            value={searchText} // Liaison avec l'état
            onChange={(e) => setSearchText(e.target.value)} // Met à jour l'état lors de la saisie
            placeholder='Rechercher...'
            className='w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-gray-800 placeholder-gray-400'
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z'
            />
          </svg>
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
