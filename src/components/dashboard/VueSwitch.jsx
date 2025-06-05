/**
 * @file VueSwitch.jsx
 * @description Composant de switch pour basculer entre la vue actuelle et la vue prévisionnelle du dashboard
 */

import React from "react";
import { Switch } from "@headlessui/react";

const VueSwitch = ({ isPrevisionnel, setIsPrevisionnel }) => {
  return (
    <div className='flex items-center justify-end mb-6 bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-4'>
      <span className='mr-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
        Vue actuelle
      </span>
      <Switch
        checked={isPrevisionnel}
        onChange={setIsPrevisionnel}
        className={`${
          isPrevisionnel ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
        <span
          className={`${
            isPrevisionnel ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <span className='ml-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
        Vue prévisionnelle
      </span>
    </div>
  );
};

export default VueSwitch;
