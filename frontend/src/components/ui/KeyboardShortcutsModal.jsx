/**
 * @file KeyboardShortcutsModal.jsx
 * @description Modal pour afficher les raccourcis clavier disponibles
 */

import React from "react";
import { SHORTCUTS } from "../../utils/keyboardShortcuts";

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50'
        onClick={onClose}></div>
      <div className='relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl'>
        <h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
          Raccourcis Clavier
        </h2>

        {/* Navigation */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
            Navigation
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {Object.entries(SHORTCUTS.NAVIGATION).map(([key, shortcut]) => (
              <div
                key={key}
                className='flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                <span className='text-gray-700 dark:text-gray-300'>
                  {shortcut.description}
                </span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono'>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Thème */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
            Thème
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {Object.entries(SHORTCUTS.THEME).map(([key, shortcut]) => (
              <div
                key={key}
                className='flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                <span className='text-gray-700 dark:text-gray-300'>
                  {shortcut.description}
                </span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono'>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200'>
            Actions rapides
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {Object.entries(SHORTCUTS.QUICK_ACTIONS).map(([key, shortcut]) => (
              <div
                key={key}
                className='flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                <span className='text-gray-700 dark:text-gray-300'>
                  {shortcut.description}
                </span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-mono'>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className='text-sm text-gray-500 dark:text-gray-400 mt-4'>
          Note : Les raccourcis ne fonctionnent pas lorsque vous êtes dans un
          champ de saisie.
        </div>

        <button
          onClick={onClose}
          className='mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors'>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
