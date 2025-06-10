/**
 * Composant SearchBar
 * Un composant de barre de recherche réutilisable avec support du mode sombre
 * Utilisé dans la sidebar pour la recherche
 */

import React, { useState, useEffect } from "react";

/**
 * @component SearchBar
 * @description Barre de recherche réutilisable avec support du mode sombre
 * @param {Object} props
 * @param {string} props.placeholder - Texte d'exemple pour la barre de recherche
 * @param {function} props.onSearch - Callback appelé lors de la recherche
 * @param {function} props.onBlur - Callback appelé quand la barre perd le focus
 * @param {boolean} props.isSidebarCollapsed - État de la sidebar (ouverte/fermée)
 */
const SearchBar = ({
  placeholder = "Rechercher...",
  onSearch,
  onBlur,
  isSidebarCollapsed,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Réinitialiser la recherche quand la sidebar se ferme
  useEffect(() => {
    if (isSidebarCollapsed) {
      setSearchTerm("");
      if (onSearch) onSearch("");
    }
  }, [isSidebarCollapsed, onSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className='relative w-full'>
      <input
        type='text'
        id='search-bar'
        value={searchTerm}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className='w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
      />
      <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
        <svg
          className='w-4 h-4 text-gray-400 dark:text-gray-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;
