/**
 * @file DarkModeSwitch.jsx
 * @description Composant de switch pour basculer entre le mode clair et le mode sombre
 */

import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Switch } from "@headlessui/react";
import { FaSun, FaMoon } from "react-icons/fa";

const DarkModeSwitch = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className='flex items-center justify-between p-4 bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow'>
      <div className='flex items-center'>
        <FaSun className='text-yellow-500 mr-2' />
        <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
          Mode clair
        </span>
      </div>
      <Switch
        checked={isDarkMode}
        onChange={toggleDarkMode}
        className={`${
          isDarkMode ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
        <span
          className={`${
            isDarkMode ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
      <div className='flex items-center'>
        <span className='text-sm font-medium text-gray-700 dark:text-gray-300 mr-2'>
          Mode sombre
        </span>
        <FaMoon className='text-blue-500' />
      </div>
    </div>
  );
};

export default DarkModeSwitch;
