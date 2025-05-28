// Fonctions utilitaires pour la gestion des paiements récurrents

import { toast } from "react-toastify";
import React, { useRef, useEffect, useState } from "react";

/**
 * Ouvre la modale d'édition pour un paiement
 * @param {Object} paiement - Le paiement à éditer
 * @param {Function} setSelectedPaiement - Setter pour le paiement sélectionné
 * @param {Function} setShowModal - Setter pour afficher la modale
 */
export function editPaiement(paiement, setSelectedPaiement, setShowModal) {
  setSelectedPaiement(paiement);
  setShowModal(true);
}

/**
 * Supprime un paiement de la liste
 * @param {number|string} id - L'identifiant du paiement à supprimer
 * @param {Function} setPaiements - Setter pour la liste des paiements
 */
export function deletePaiement(id, setPaiements) {
  setPaiements((prev) => prev.filter((p) => p.id !== id));
}

// Composant barre de progression custom pour Toastify
const ToastProgressBar = ({ duration, onCancel }) => {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef();

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [duration]);

  return (
    <div className='flex items-center w-full mt-2 gap-2'>
      <div className='flex-1 h-2 bg-gray-300 rounded relative overflow-hidden'>
        <div
          className='h-2 bg-blue-500 rounded transition-all duration-100'
          style={{ width: `${progress}%` }}
        />
      </div>
      <button
        className='ml-2 px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded shadow hover:bg-red-700 transition relative z-10'
        onClick={onCancel}
        style={{ background: "#ef4444", minWidth: 70 }}>
        Annuler
      </button>
    </div>
  );
};

const ToastProgressCircle = ({ duration, remaining, onCancel }) => {
  const radius = 24;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = remaining / (duration / 1000);
  const offset = circumference * (1 - progress);

  return (
    <div className='flex items-center gap-4 mt-2 mb-1'>
      <div
        style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke='#e5e7eb'
            fill='transparent'
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke='#2563eb'
            fill='transparent'
            strokeWidth={stroke}
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transition: "stroke-dashoffset 0.3s cubic-bezier(.4,2,.6,1)",
            }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#222",
            letterSpacing: "-1px",
            userSelect: "none",
          }}>
          {remaining}
        </span>
      </div>
      <button
        className='px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded shadow hover:bg-red-600 transition'
        onClick={onCancel}
        style={{ minWidth: 80 }}>
        Annuler
      </button>
    </div>
  );
};

const ToastDeleteCountdown = ({ duration, label, onCancel }) => {
  const [remaining, setRemaining] = useState(duration / 1000);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => (r > 1 ? r - 1 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [duration]);
  return (
    <div className='flex items-start gap-4 mt-2 mb-1' style={{ width: 750 }}>
      <div
        style={{
          width: "calc(100% - 150px)",
          color: "#1e293b",
          fontSize: "1.15rem",
          lineHeight: 1.35,
          fontWeight: 500,
        }}>
        Suppression de <b style={{ fontWeight: 700 }}>{label}</b>
        <br />
        dans <b>{remaining}</b> seconde{remaining > 1 ? "s" : ""}…
      </div>
      <div
        style={{
          width: 150,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingRight: 32,
        }}>
        <button
          className='px-2 py-2 text-base font-semibold text-white bg-red-500 rounded shadow hover:bg-red-600 transition w-full'
          onClick={onCancel}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "1.1rem",
          }}>
          Annuler
        </button>
      </div>
    </div>
  );
};

/**
 * Supprime un paiement avec toast d'annulation (undo)
 * @param {number|string} id - L'identifiant du paiement à supprimer
 * @param {Function} setPaiements - Setter pour la liste des paiements
 * @param {string} [label] - Label à afficher dans le toast
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
    ({ closeToast }) => (
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
