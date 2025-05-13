import React from "react";
import ToastItem from "./ToastItem";

// Re-export ToastItem pour d'autres composants qui en ont besoin
export { ToastItem };

// Composant Toast pour la rétrocompatibilité
export default function Toast({
  open,
  message,
  type,
  loading,
  onClose,
  action,
}) {
  if (!open) return null;

  // Créer un objet toast compatible avec ToastItem
  const toast = {
    message,
    type,
    loading,
    action,
  };

  return <ToastItem toast={toast} onClose={onClose} />;
}
