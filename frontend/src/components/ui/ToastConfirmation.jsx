/**
 * ToastConfirmation.jsx
 * Composant de confirmation avec compte à rebours pour les actions de suppression
 * Utilisé pour confirmer la suppression d'éléments avec possibilité d'annulation
 */

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Styles réutilisables pour le toast
const toastTextStyle = {
  color: "#1e293b",
  fontSize: "1.15rem",
  lineHeight: 1.35,
  fontWeight: 500,
  width: "calc(100% - 150px)",
};

const toastButtonContainerStyle = {
  width: 150,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "flex-start",
  paddingRight: 32,
};

const toastButtonStyle = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "1.1rem",
};

/**
 * Toast personnalisé avec décompte et bouton Annuler
 */
const ToastDeleteCountdown = ({ duration, label, onCancel }) => {
  const [remaining, setRemaining] = useState(duration / 1000);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => (r > 1 ? r - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [duration]);
  return (
    <div className='flex items-start gap-4 mt-2 mb-1' style={{ width: 600 }}>
      <div style={toastTextStyle}>
        Suppression de <b style={{ fontWeight: 700 }}>{label}</b>
        <br />
        dans <b>{remaining}</b> seconde{remaining > 1 ? "s" : ""}…
      </div>
      <div style={toastButtonContainerStyle}>
        <button
          className='px-2 py-2 text-base font-semibold text-white bg-red-500 rounded shadow hover:bg-red-600 transition w-full'
          onClick={onCancel}
          style={toastButtonStyle}>
          Annuler
        </button>
      </div>
    </div>
  );
};

/**
 * Affiche une confirmation de suppression avec compte à rebours
 * @param {Object} options - Options de configuration
 * @param {string} options.label - Le nom de l'élément à supprimer
 * @param {number} options.duration - Durée du compte à rebours en ms (défaut: 5000)
 * @param {Function} options.onConfirm - Callback appelé après le compte à rebours
 * @param {Function} options.onCancel - Callback appelé si l'utilisateur annule
 * @returns {string} - L'ID du toast pour pouvoir le fermer programmatiquement
 */
export const showDeleteConfirmation = ({
  label,
  duration = 5000,
  onConfirm,
  onCancel,
}) => {
  let toastId;
  let isCancelled = false;

  const handleCancel = () => {
    isCancelled = true;
    if (onCancel) onCancel();
    toast.dismiss(toastId);
  };

  toastId = toast(
    () => (
      <ToastDeleteCountdown
        duration={duration}
        label={label}
        onCancel={handleCancel}
      />
    ),
    {
      autoClose: duration,
      closeOnClick: false,
      draggable: false,
      pauseOnHover: false,
      onClose: () => {
        if (!isCancelled && onConfirm) {
          onConfirm();
        }
      },
      position: "top-right",
      toastId: `delete-${Date.now()}`,
    }
  );

  return toastId;
};

/**
 * Exemple d'utilisation :
 *
 * import { showDeleteConfirmation } from './components/ui/ToastConfirmation';
 *
 * const handleDelete = (item) => {
 *   showDeleteConfirmation({
 *     label: item.nom,
 *     onConfirm: () => {
 *       // Logique de suppression
 *       setItems(prev => prev.filter(i => i.id !== item.id));
 *     },
 *     onCancel: () => {
 *       // Logique d'annulation si nécessaire
 *     }
 *   });
 * };
 */
const ToastConfirmation = {
  showDeleteConfirmation,
};

export default ToastConfirmation;
