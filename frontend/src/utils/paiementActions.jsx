// Fonctions utilitaires pour la gestion des paiements récurrents

import { toast } from "react-toastify";
import React, { useRef, useEffect, useState } from "react";

/**
 * Ouvre la modale d'édition pour un paiement
 */
export function editPaiement(paiement, setSelectedPaiement, setShowModal) {
  setSelectedPaiement(paiement);
  setShowModal(true);
}

/**
 * Supprime un paiement de la liste
 */
export function deletePaiement(id, setPaiements) {
  setPaiements((prev) => prev.filter((p) => p.id !== id));
}

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
 * Supprime un paiement avec toast d'annulation (undo)
 */
export function deletePaiementWithUndo(id, setPaiements, label = "Paiement") {
  let undo = false;
  let toastId;
  const duration = 5000;

  const handleCancel = () => {
    undo = true;
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
        if (!undo) setPaiements((prev) => prev.filter((p) => p.id !== id));
      },
      position: "top-right",
      toastId: `delete-${id}`,
    }
  );
}
