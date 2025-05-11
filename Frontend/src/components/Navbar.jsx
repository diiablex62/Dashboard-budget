import React, { useContext, useState, useEffect, useRef } from "react";
import { AiOutlineBell, AiOutlineHome } from "react-icons/ai";
import { FiSun, FiMoon } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";
import Google from "./Google";
import GitHub from "./GitHub";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { isSettingsOpen, setIsSettingsOpen, isLoggedIn, setIsLoggedIn } =
    useContext(AppContext);

  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }

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

  const TITLES = {
    "/": "Dashboard",
    "/profil": "Profil",
    "/agenda": "Agenda",
    "/paiements-recurrents": "Paiements récurrents",
    "/paiements-echelonnes": "Paiements échelonnés",
    "/depenses-revenus": "Dépenses & Revenus",
    "/notifications": "Notifications",
    "/auth": "Authentification",
    "/privacy-policy": "Politique de confidentialité",
    "/privacy": "Politique de confidentialité",
    "/user-data-deletion": "Suppression des données",
    "/terms": "Conditions d'utilisation",
  };
  const activeTitle = TITLES[location.pathname] || "Dashboard";

  return (
    <div className='w-full p-4 flex items-center justify-between bg-white dark:bg-black dark:text-gray-200'>
      <div className='flex items-center space-x-2 text-gray-600 dark:text-white'>
        <AiOutlineHome
          className='text-xl cursor-pointer dark:text-white'
          onClick={() => navigate("/")}
        />
        <span className='dark:text-white'>/</span>
        <span className='text-lg font-medium text-gray-800 dark:text-white'>
          {activeTitle}
        </span>
      </div>
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <input
            type='text'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder='Rechercher...'
            className='w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-gray-800 placeholder-gray-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white h-5 w-5'
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
        <button
          onClick={toggleDarkMode}
          className='flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 transition'
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}>
          {isDarkMode ? (
            <FiSun className='text-xl text-yellow-400' />
          ) : (
            <FiMoon className='text-xl text-gray-600' />
          )}
        </button>
        <div className='relative'>
          <div onClick={() => navigate("/notifications")}>
            <NotificationBell />
          </div>
        </div>
        {isLoggedIn && (
          <div className='relative' ref={dropdownRef}>
            <div
              className='w-10 h-10 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center cursor-pointer text-lg font-bold shadow-md'
              onClick={toggleDropdown}>
              {user?.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : "?"}
            </div>
            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-64 border border-gray-200 dark:border-gray-700 z-50'>
                <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-white text-lg font-bold'>
                      {user?.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-800 dark:text-white'>
                        {user?.displayName || "Utilisateur"}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {user?.email || "Email inconnu"}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className='text-sm text-gray-800 dark:text-white'>
                  <li
                    className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                      location.pathname === "/profil"
                        ? "bg-gray-100 dark:bg-gray-700 font-bold"
                        : ""
                    }`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/profil");
                    }}>
                    Mon profil
                  </li>
                  <li
                    className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsSettingsOpen(true);
                    }}>
                    Paramètres
                  </li>
                </ul>
                <hr className='my-1 dark:border-gray-700' />
                <div
                  className='px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                  onClick={() => {
                    setIsDropdownOpen(false);
                    localStorage.removeItem("user");
                    setIsLoggedIn(false);
                    navigate("/");
                  }}>
                  Se déconnecter
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}
    </div>
  );
}
