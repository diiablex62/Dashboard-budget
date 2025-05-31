import React, { useState } from "react";
import { useSynchro } from "../../context/SynchroContext";
import { AiOutlineClose } from "react-icons/ai";

const REASONS = ["Réconciliation bancaire", "Erreur de saisie", "Autre"];

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
      updateBalance(parsedBalance, reason === "Autre" ? customReason : reason);
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
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      onClick={handleBackdropClick}>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg relative shadow-lg'>
        <button
          onClick={onClose}
          className='absolute top-5 right-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors'>
          <AiOutlineClose className='text-2xl' />
        </button>
        <h2 className='text-2xl font-bold mb-2 dark:text-white pr-8'>
          Mettre à jour le solde du compte
        </h2>
        <div className='text-gray-500 text-base mb-8'>
          Ajustez le solde pour refléter le montant réel de votre compte. Cela
          permet de corriger les écarts dus à des transactions non saisies.
        </div>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
              <label className='font-semibold text-base text-gray-900 dark:text-gray-200 min-w-[120px]'>
                Solde actuel
              </label>
              <span className='text-2xl font-bold text-gray-900 dark:text-white'>
                {currentCalculatedBalance.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                €
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <label className='font-semibold text-base text-gray-900 dark:text-gray-200 min-w-[120px]'>
                Nouveau solde
              </label>
              <input
                type='number'
                step='0.01'
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className='w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg text-right'
                placeholder='0.00'
                required
              />
            </div>
            {newBalance && (
              <div className='flex items-center justify-between'>
                <label className='font-semibold text-base text-gray-900 dark:text-gray-200 min-w-[120px]'>
                  Différence
                </label>
                <div
                  className={`text-2xl font-bold ${
                    difference > 0 ? "text-red-600" : "text-green-600"
                  }`}>
                  {difference > 0 ? "+" : ""}
                  {difference.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  €
                </div>
              </div>
            )}
            <div className='flex items-center justify-between'>
              <label className='font-semibold text-base text-gray-900 dark:text-gray-200 min-w-[120px]'>
                Raison
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className='w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base'
                required>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            {reason === "Autre" && (
              <div className='flex items-center justify-between'>
                <label className='font-semibold text-base text-gray-900 dark:text-gray-200 min-w-[120px]'>
                  Précisez
                </label>
                <input
                  type='text'
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className='w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base'
                  placeholder='Votre raison...'
                  required
                />
              </div>
            )}
          </div>
          <div className='flex justify-end gap-4 mt-8'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'>
              Annuler
            </button>
            <button
              type='submit'
              className='px-6 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 font-semibold'>
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
