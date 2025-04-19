import React, { useContext, useState } from "react";
import { AiOutlineBell, AiOutlineHome } from "react-icons/ai";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import SettingsPanel from "./SettingsPanel"; // Importez SettingsPanel

export default function Navbar() {
  const {
    activeTitle,
    isNavbarFixed,
    isSettingsOpen,
    setIsSettingsOpen,
    isLoggedIn,
    setIsLoggedIn, // Ajoutez setIsLoggedIn ici
  } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <div
      className={`w-full p-4 flex items-center justify-between ${
        isNavbarFixed ? "fixed top-0 left-0 bg-white shadow-md z-50" : ""
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
          <div className='relative'>
            <div
              className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer'
              onClick={toggleDropdown}>
              <span className='text-sm font-bold text-gray-800'>S</span>
            </div>
            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2'>
                <div className='px-4 py-2 text-sm text-gray-800'>
                  <p className='font-bold'>shadcn</p>
                  <p className='text-gray-500'>m@example.com</p>
                </div>
                <hr className='my-1' />
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
                    navigate("/logout");
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
