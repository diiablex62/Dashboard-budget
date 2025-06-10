/**
 * Composant SearchBar
 * Un composant de barre de recherche réutilisable avec support du mode sombre
 * Utilisé dans la sidebar pour la recherche
 */

import React from "react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  id = "search-bar",
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type='text'
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='w-full bg-gray-100 dark:bg-[#18181b] px-3 py-2 rounded-lg text-sm text-gray-700 placeholder-gray-400 dark:text-white dark:placeholder-gray-400 outline-none'
      />
      <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
        <svg
          className='w-5 h-5 text-gray-400 dark:text-gray-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;
