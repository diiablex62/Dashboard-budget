import React, { useState } from "react";
import { useSynchro } from "../../context/SynchroContext";
import { formatMontant } from "../../utils/calcul";

const REASONS = ["Réconciliation bancaire", "Oublie de saisie", "Autre"];

export default function SynchroUpdateModal({
  isOpen,
  onClose,
  currentCalculatedBalance,
}) {
  const [newBalance, setNewBalance] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const { updateBalance } = useSynchro();

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedBalance = parseFloat(newBalance);
    if (!isNaN(parsedBalance)) {
      const oldBalance = currentCalculatedBalance;
      const diff = +(parsedBalance - oldBalance).toFixed(2);
      updateBalance(parsedBalance, reason === "Autre" ? customReason : reason);
      // Ajout dans le localStorage si différence non nulle
      if (diff !== 0) {
        const op = {
          id: Date.now(),
          type: diff > 0 ? "revenu" : "depense",
          montant: Math.abs(diff),
          nom: reason === "Autre" ? customReason : reason,
          date: new Date().toISOString(),
          categorie: "Autres",
        };
        const synchroSolde = JSON.parse(
          localStorage.getItem("synchrosolde") || "[]"
        );
        synchroSolde.push(op);
        localStorage.setItem("synchrosolde", JSON.stringify(synchroSolde));
        window.dispatchEvent(new Event("data-updated"));
      }
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const difference = currentCalculatedBalance - parseFloat(newBalance || 0);

  return (
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={handleBackdropClick}>
      <div className='bg-white dark:bg-black rounded-lg shadow-lg p-8 w-full max-w-md relative'>
        <button
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'
          aria-label='Fermer'>
          ✕
        </button>
        <div className='mb-6'>
          <div className='text-lg font-semibold dark:text-white mb-1'>
            Mettre à jour le solde du compte
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Ajustez le solde pour refléter le montant réel de votre compte. Cela
            permet de corriger les écarts dus à des transactions non saisies.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block mb-2 font-medium dark:text-white'>
              Je corrige mon solde de
            </label>
            <div className='text-2xl font-bold'>
              {formatMontant(currentCalculatedBalance)}€
            </div>
          </div>
          <div className='mb-4'>
            <label className='block mb-2 font-medium dark:text-white'>
              Nouveau solde
            </label>
            <input
              type='number'
              step='0.01'
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2 text-lg'
              placeholder='0.00'
              required
            />
          </div>
          {newBalance && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                Différence
              </label>
              <div
                className={`text-2xl font-bold ${
                  difference > 0 ? "text-red-600" : "text-green-600"
                }`}>
                {difference > 0 ? "+" : ""}
                {formatMontant(difference)}€
              </div>
            </div>
          )}
          <div className='mb-4'>
            <label className='block mb-2 font-medium dark:text-white'>
              Raison
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
              required>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {reason === "Autre" && (
            <div className='mb-4'>
              <label className='block mb-2 font-medium dark:text-white'>
                Précisez
              </label>
              <input
                type='text'
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className='w-full border dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded px-3 py-2'
                placeholder='Votre raison...'
                required
              />
            </div>
          )}
          <div className='flex justify-end mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='bg-gray-100 text-gray-800 px-4 py-2 rounded mr-2 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'>
              Annuler
            </button>
            <button
              type='submit'
              className='bg-gray-900 text-white px-4 py-2 rounded cursor-pointer ml-auto hover:bg-gray-800 transition'>
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
