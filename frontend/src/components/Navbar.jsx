import React, { useContext, useState, useEffect, useRef } from "react";
import { AiOutlineBell, AiOutlineHome } from "react-icons/ai";
import { FiSun, FiMoon } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsPanel from "./SettingsPanel";
import Google from "./Google";
import GitHub from "./GitHub";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { isSettingsOpen, setIsSettingsOpen, isLoggedIn, setIsLoggedIn } =
    useContext(AppContext);
  const { user, logout, reloadUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchText(value);
    setIsSearching(true);

    if (value.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    try {
      // Ici, vous devrez implémenter la recherche avec votre backend
      // Pour l'instant, nous retournons un tableau vide
      setSearchResults([]);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <nav className='bg-white dark:bg-gray-800 shadow-md'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <div className='flex-shrink-0 flex items-center'>
              <button
                onClick={() => navigate("/")}
                className='text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                <AiOutlineHome className='h-6 w-6' />
              </button>
            </div>
          </div>

          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <button
                onClick={toggleDarkMode}
                className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                {isDarkMode ? (
                  <FiSun className='h-6 w-6' />
                ) : (
                  <FiMoon className='h-6 w-6' />
                )}
              </button>
            </div>

            {isLoggedIn && (
              <>
                <div className='ml-4 flex items-center'>
                  <NotificationBell />
                </div>

                <div className='ml-4 flex items-center'>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                    <AiOutlineBell className='h-6 w-6' />
                  </button>
                </div>

                <div className='ml-4 flex items-center'>
                  <button
                    onClick={handleLogout}
                    className='p-2 rounded-md text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300'>
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsPanel setIsSettingsOpen={setIsSettingsOpen} />
      )}
    </nav>
  );
}
