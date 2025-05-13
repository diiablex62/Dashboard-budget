import React, { useEffect, useState, useRef } from "react";

// Un seul élément toast
export default function ToastItem({ toast, onClose }) {
  const {
    id,
    message,
    type = "success",
    loading = false,
    action,
    duration = 5000,
  } = toast;
  const [isVisible, setIsVisible] = useState(true);
  // Référence pour suivre si le composant est toujours monté
  const isMounted = useRef(true);
  // Référence pour le timer
  const timerRef = useRef(null);

  // Log au montage
  useEffect(() => {
    console.log(`Toast monté: ${id}, message: ${message}, loading: ${loading}`);

    return () => {
      console.log(`Toast démonté: ${id}, message: ${message}`);
      isMounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, message, loading]);

  // Effet pour supprimer automatiquement le toast après le délai
  useEffect(() => {
    // Ne mettre en place le timer que pour les toasts non-loading
    if (!loading) {
      console.log(`Mise en place du timer pour toast ${id} (${duration}ms)`);

      timerRef.current = setTimeout(() => {
        console.log(`Timer expiré pour toast ${id}`);
        if (isMounted.current) {
          setIsVisible(false);

          // Appeler onClose après l'animation
          setTimeout(() => {
            console.log(
              `Animation terminée, appel de onClose pour toast ${id}`
            );
            if (isMounted.current && onClose) {
              onClose();
            }
          }, 300);
        }
      }, duration);
    } else {
      console.log(`Toast ${id} est en loading, pas de timer automatique`);
    }

    return () => {
      if (timerRef.current) {
        console.log(`Nettoyage du timer pour toast ${id}`);
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, onClose, loading, duration]);

  // Fonction pour fermer manuellement le toast
  const handleClose = () => {
    console.log(`Fermeture manuelle du toast ${id}`);
    setIsVisible(false);
    setTimeout(() => {
      if (isMounted.current && onClose) {
        onClose();
      }
    }, 300);
  };

  let color = "bg-green-600 text-white";
  if (type === "error") color = "bg-red-600 text-white";
  if (type === "loading") color = "bg-blue-600 text-white";

  // Si déjà en train de disparaître, ajouter une classe pour l'animation
  const fadeClass = isVisible ? "opacity-100" : "opacity-0";

  return (
    <div
      className={`min-w-[260px] max-w-xs shadow-lg rounded-lg px-5 py-4 flex items-center justify-between ${color} transition-opacity duration-300 ${fadeClass}`}
      role='alert'>
      <div className='flex items-center'>
        {loading && (
          <svg
            className='animate-spin h-5 w-5 text-white mr-2'
            viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
              fill='none'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
            />
          </svg>
        )}
        <span className='text-base whitespace-nowrap'>{message}</span>
      </div>
      {action && (
        <button
          className='ml-3 px-3 py-1 rounded bg-white text-blue-700 font-semibold hover:bg-blue-50 transition'
          onClick={action.onClick}>
          {action.label || "Annuler"}
        </button>
      )}
      <button
        onClick={handleClose}
        className='ml-3 text-white opacity-70 hover:opacity-100 transition'
        aria-label='Fermer'>
        ✕
      </button>
    </div>
  );
}
