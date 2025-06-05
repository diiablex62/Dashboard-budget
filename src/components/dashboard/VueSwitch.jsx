/**
 * @file VueSwitch.jsx
 * @description Composant de switch pour basculer entre la vue actuelle et la vue prévisionnelle du dashboard
 */

import React from "react";

const VueSwitch = ({ isPrevisionnel, setIsPrevisionnel }) => {
  return (
    <div className='flex items-center gap-3'>
      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        Vue Actuelle
      </span>

      <label className='relative inline-flex items-center cursor-pointer'>
        <input
          type='checkbox'
          checked={isPrevisionnel}
          onChange={(e) => setIsPrevisionnel(e.target.checked)}
          className='sr-only peer'
        />
        <div className='group peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-300 w-14 h-7 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-["A"] after:rounded-full after:absolute after:bg-gray-50 after:outline-none after:h-5 after:w-5 after:top-1 after:left-1 after:rotate-0 after:flex after:justify-center after:items-center after:text-xs after:font-bold after:text-gray-800 peer-checked:after:translate-x-7 peer-checked:after:content-["P"] peer-hover:after:scale-95 peer-checked:after:rotate-[360deg]'></div>
      </label>

      <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
        Vue Prévisionnelle
      </span>
    </div>
  );
};

export default VueSwitch;
