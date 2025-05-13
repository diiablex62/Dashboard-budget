import React from "react";
import ToastItem from "./ToastItem";

// Contrôleur de Toast qui gère plusieurs notifications
export default function ToastManager({ toasts = [], onClose }) {
  if (!toasts || toasts.length === 0) return null;

  // S'assurer que les toasts sont affichés dans l'ordre chronologique
  // Les plus anciens en haut, les plus récents en bas
  const sortedToasts = [...toasts].sort((a, b) => {
    // Utiliser l'identifiant unique qui contient déjà une part du timestamp
    return a.id - b.id;
  });

  return (
    <div className='fixed right-6 top-6 z-50 flex flex-col gap-3 pointer-events-none'>
      <div className='flex flex-col gap-3 items-end pointer-events-auto'>
        {sortedToasts.map((toast, index) => (
          <ToastItem
            key={toast.id || index}
            toast={toast}
            onClose={() => onClose(toast.id || index)}
          />
        ))}
      </div>
    </div>
  );
}
