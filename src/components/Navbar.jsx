import React, { useContext, useState, useEffect, useRef } from "react";
import { AiOutlineBell, AiOutlineHome } from "react-icons/ai";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext"; // Importez ThemeContext
import { useNavigate } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";
import Google from "./Google"; // Importez le logo Google
import GitHub from "./GitHub"; // Importez le nouveau logo GitHub

export default function Navbar() {
  const {
    activeTitle,
    isNavbarFixed,
    isSettingsOpen,
    setIsSettingsOpen,
    isLoggedIn,
    setIsLoggedIn,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null); // Stocke les informations de l'utilisateur
  const dropdownRef = useRef(null); // Référence pour détecter les clics en dehors

  useEffect(() => {
    // Récupérez les informations de l'utilisateur depuis le localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

    // Gestionnaire de clic pour fermer le dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <div
      className={`w-full p-4 flex items-center justify-between ${
        isNavbarFixed
          ? "fixed top-0 left-0 shadow-md z-50 bg-white"
          : "bg-white"
      }`}>
      <div className='flex items-center space-x-2 text-gray-600'>
        <AiOutlineHome
          className='text-xl cursor-pointer'
          onClick={() => navigate("/")}
        />
        <span>/</span>
        <span className='text-lg font-medium text-gray-800'>{activeTitle}</span>
      </div>
      {isLoggedIn && (
        <div className='flex items-center space-x-4'>
          <div className='relative flex-1 max-w-md'>
            <input
              type='text'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
          <div className='relative' ref={dropdownRef}>
            <div
              className='w-10 h-10 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center cursor-pointer text-lg font-bold shadow-md'
              onClick={toggleDropdown}>
              {user?.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : "?"}
            </div>
            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 bg-white shadow-lg rounded-lg py-2 w-64 border border-gray-200'>
                <div className='px-4 py-3 border-b border-gray-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-lg font-bold'>
                      {user?.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-800'>
                        {user?.displayName || "Utilisateur"}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {user?.email || "Email inconnu"}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className='text-sm text-gray-800'>
                  <li
                    className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                    onClick={() => navigate("/profile")}>
                    Mon profil
                  </li>
                  <li
                    className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsSettingsOpen(true);
                    }}>
                    Paramètres
                  </li>
                </ul>
                <hr className='my-1' />
                <div
                  className='px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer'
                  onClick={() => {
                    setIsDropdownOpen(false);
                    localStorage.removeItem("user"); // Supprimez les informations de l'utilisateur
                    setIsLoggedIn(false); // Mettez à jour l'état de connexion
                    navigate("/"); // Redirigez vers le tableau de bord
                  }}>
                  Se déconnecter
                </div>
              </div>
            )}
          </div>
          <AiOutlineBell
            className='text-gray-500 text-2xl cursor-pointer'
            title='Notifications'
          />
        </div>
      )}
      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}
    </div>
  );
}
