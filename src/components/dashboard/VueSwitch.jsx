/**
 * @file VueSwitch.jsx
 * @description Composant de switch pour basculer entre la vue actuelle et la vue prévisionnelle du dashboard
 */

import React, { useState } from "react";

const VueSwitch = ({ isPrevisionnel, setIsPrevisionnel }) => {
  const [hovered, setHovered] = useState(null);
  const switchClasses = [
    "group peer ring-0 rounded-full outline-none duration-300",
    "w-14 h-7 shadow-md",
    "bg-rose-400 peer-checked:bg-emerald-500",
    "peer-focus:outline-none",
    // Classes pour le bouton interne
    "after:content-['A'] peer-checked:after:content-['P']",
    "after:absolute after:top-1 after:left-1",
    "after:h-5 after:w-5 after:rounded-full after:bg-gray-50",
    "after:flex after:justify-center after:items-center",
    "after:text-xs after:font-bold after:text-gray-800",
    "after:outline-none after:duration-300",
    // Animations
    "after:rotate-0 peer-checked:after:rotate-[360deg]",
    "peer-checked:after:translate-x-7",
    "peer-hover:after:scale-95",
  ].join(" ");

  return (
    <div className='flex items-center gap-3'>
      <span
        className='text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer relative'
        onMouseEnter={() => setHovered("A")}
        onMouseLeave={() => setHovered(null)}>
        Actuelle
        {hovered === "A" && (
          <span className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 shadow'>
            A
          </span>
        )}
      </span>

      <label className='relative inline-flex items-center cursor-pointer'>
        <input
          type='checkbox'
          checked={isPrevisionnel}
          onChange={(e) => setIsPrevisionnel(e.target.checked)}
          className='sr-only peer'
          aria-label='Basculer entre vue actuelle et vue prévisionnelle'
        />
        <div className={switchClasses} />
      </label>

      <span
        className='text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer relative'
        onMouseEnter={() => setHovered("P")}
        onMouseLeave={() => setHovered(null)}>
        Prévisionnelle
        {hovered === "P" && (
          <span className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 shadow'>
            P
          </span>
        )}
      </span>
    </div>
  );
};

export default VueSwitch;
