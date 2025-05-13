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
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

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

  useEffect(() => {
    // Recharge le user Firebase pour récupérer le nouveau photoURL après upload
    if (user && typeof user.reload === "function") {
      user.reload();
    }
  }, [user?.photoURL]);

  // Fonction de recherche dans Firestore
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Recherche dans les dépenses
      const depensesSnap = await getDocs(
        query(collection(db, "depense"), orderBy("nom"), limit(5))
      );
      const depenses = depensesSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "depense",
          path: "/depenses-revenus",
        }))
        .filter(
          (item) =>
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.categorie &&
              item.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      // Recherche dans les revenus
      const revenusSnap = await getDocs(
        query(collection(db, "revenu"), orderBy("nom"), limit(5))
      );
      const revenus = revenusSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "revenu",
          path: "/depenses-revenus",
        }))
        .filter(
          (item) =>
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.categorie &&
              item.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      // Recherche dans les paiements récurrents
      const recurrentSnap = await getDocs(
        query(collection(db, "recurrent"), orderBy("nom"), limit(5))
      );
      const recurrents = recurrentSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "paiement récurrent",
          path: "/paiements-recurrents",
        }))
        .filter(
          (item) =>
            item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.categorie &&
              item.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
        );

      // Combiner les résultats et limiter à 10
      const allResults = [...depenses, ...revenus, ...recurrents].slice(0, 10);
      setSearchResults(allResults);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Délai de recherche pour éviter trop de requêtes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      handleSearch(searchText);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchText]);

  // Effacer les résultats lors du changement de page
  useEffect(() => {
    setSearchText("");
    setSearchResults([]);
    setShowSearchResults(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      navigate("/");
      console.log("Vous avez été déconnecté avec succès");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

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
        <div className='relative flex-1 max-w-md' ref={searchRef}>
          <input
            type='text'
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
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

          {/* Résultats de recherche */}
          {showSearchResults && (
            <div className='absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 max-h-96 overflow-auto z-50 border border-gray-200 dark:border-gray-700'>
              {isSearching ? (
                <div className='px-4 py-3 text-sm text-gray-600 dark:text-gray-300 flex items-center'>
                  <svg
                    className='animate-spin h-4 w-4 mr-2 text-gray-500'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Recherche en cours...
                </div>
              ) : searchResults.length === 0 && searchText.length >= 3 ? (
                <div className='px-4 py-3 text-sm text-gray-600 dark:text-gray-300'>
                  Aucun résultat trouvé pour "{searchText}"
                </div>
              ) : searchResults.length === 0 ? (
                <div className='px-4 py-3 text-sm text-gray-600 dark:text-gray-300'>
                  Saisissez au moins 3 caractères pour rechercher
                </div>
              ) : (
                <>
                  <div className='px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Résultats ({searchResults.length})
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                      onClick={() => {
                        navigate(result.path);
                        setShowSearchResults(false);
                      }}>
                      <div className='flex items-center'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            result.type === "depense"
                              ? "bg-red-100 text-red-600"
                              : result.type === "revenu"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}>
                          <span>
                            {result.type === "depense"
                              ? "-"
                              : result.type === "revenu"
                              ? "+"
                              : "⟳"}
                          </span>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-gray-800 dark:text-white'>
                            {result.nom.charAt(0).toUpperCase() +
                              result.nom.slice(1)}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2'>
                            <span className='capitalize'>{result.type}</span>
                            {result.categorie && (
                              <>
                                <span>•</span>
                                <span>{result.categorie}</span>
                              </>
                            )}
                            {result.montant !== undefined && (
                              <>
                                <span>•</span>
                                <span
                                  className={`${
                                    result.type === "depense"
                                      ? "text-red-500"
                                      : "text-green-500"
                                  }`}>
                                  {Math.abs(result.montant).toFixed(2)} €
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={toggleDarkMode}
          className='flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer'
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}>
          {isDarkMode ? (
            <FiSun className='text-xl text-yellow-400 cursor-pointer' />
          ) : (
            <FiMoon className='text-xl text-gray-600 cursor-pointer' />
          )}
        </button>
        <div className='relative'>
          <div
            onClick={() => navigate("/notifications")}
            className='cursor-pointer'>
            <NotificationBell />
          </div>
        </div>
        {user && (
          <div className='relative' ref={dropdownRef}>
            <div
              className='w-10 h-10 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center cursor-pointer text-lg font-bold shadow-md overflow-hidden'
              onClick={toggleDropdown}>
              {/* Correction : on affiche la photo si user.photoURL existe ET commence par http (donc une vraie image, pas une lettre) */}
              {user?.photoURL && user.photoURL.startsWith("http") ? (
                <img
                  src={user.photoURL}
                  alt='Profil'
                  className='w-full h-full object-cover rounded-full'
                />
              ) : user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                "?"
              )}
            </div>
            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 w-64 border border-gray-200 dark:border-gray-700 z-50'>
                <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-700'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-white text-lg font-bold overflow-hidden'>
                      {user?.photoURL && user.photoURL.startsWith("http") ? (
                        <img
                          src={user.photoURL}
                          alt='Profil'
                          className='w-full h-full object-cover rounded-full'
                        />
                      ) : user?.displayName ? (
                        user.displayName.charAt(0).toUpperCase()
                      ) : (
                        "?"
                      )}
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
                <button
                  onClick={() => {
                    navigate("/profil");
                    setIsDropdownOpen(false);
                  }}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
                  Profil
                </button>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
                  Paramètres
                </button>
                <button
                  onClick={handleLogout}
                  className='w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
                  Se déconnecter
                </button>
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
