/**
 * ToastMessage.jsx
 * Composant de notification personnalisé utilisant react-toastify
 * Utilisé pour afficher des messages de succès, d'erreur, d'information ou d'avertissement
 */

import React from "react";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

/**
 * Affiche une notification de succès
 * @param {string} message - Le message à afficher
 * @param {Object} options - Options supplémentaires pour la notification
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(
    <div className='flex items-center gap-2'>
      <FaCheckCircle className='text-green-500 text-xl' />
      <span>{message}</span>
    </div>,
    {
      ...options,
    }
  );
};

/**
 * Affiche une notification d'erreur
 * @param {string} message - Le message à afficher
 * @param {Object} options - Options supplémentaires pour la notification
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(
    <div className='flex items-center gap-2'>
      <FaExclamationCircle className='text-red-500 text-xl' />
      <span>{message}</span>
    </div>,
    {
      ...options,
    }
  );
};

/**
 * Affiche une notification d'information
 * @param {string} message - Le message à afficher
 * @param {Object} options - Options supplémentaires pour la notification
 */
export const showInfoToast = (message, options = {}) => {
  toast.info(
    <div className='flex items-center gap-2'>
      <FaInfoCircle className='text-blue-500 text-xl' />
      <span>{message}</span>
    </div>,
    {
      ...options,
    }
  );
};

/**
 * Affiche une notification d'avertissement
 * @param {string} message - Le message à afficher
 * @param {Object} options - Options supplémentaires pour la notification
 */
export const showWarningToast = (message, options = {}) => {
  toast.warning(
    <div className='flex items-center gap-2'>
      <FaExclamationTriangle className='text-yellow-500 text-xl' />
      <span>{message}</span>
    </div>,
    {
      ...options,
    }
  );
};

/**
 * Composant ToastMessage
 * Exemple d'utilisation :
 *
 * import { showSuccessToast, showErrorToast } from './components/ui/ToastMessage';
 *
 * // Dans votre composant
 * const handleSuccess = () => {
 *   showSuccessToast('Opération réussie !');
 * };
 *
 * const handleError = () => {
 *   showErrorToast('Une erreur est survenue');
 * };
 */
const ToastMessage = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
};

export default ToastMessage;
