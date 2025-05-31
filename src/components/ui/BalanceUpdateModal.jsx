import React, { useState } from "react";
import { useBalance } from "../../context/BalanceContext";

export default function BalanceUpdateModal({
  isOpen,
  onClose,
  currentCalculatedBalance,
}) {
  const [newBalance, setNewBalance] = useState("");
  const [reason, setReason] = useState("");
  const { updateBalance } = useBalance();

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedBalance = parseFloat(newBalance);
    if (!isNaN(parsedBalance)) {
      updateBalance(parsedBalance, reason);
      onClose();
    }
  };

  if (!isOpen) return null;

  const difference = currentCalculatedBalance - parseFloat(newBalance || 0);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4 dark:text-white'>
          Mise à jour du solde
        </h2>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Solde calculé actuel
            </label>
            <div className='text-lg font-semibold text-gray-900 dark:text-white'>
              {currentCalculatedBalance.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </div>
          </div>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Nouveau solde
            </label>
            <input
              type='number'
              step='0.01'
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='0.00'
              required
            />
          </div>

          {newBalance && (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Différence
              </label>
              <div
                className={`text-lg font-semibold ${
                  difference > 0 ? "text-red-600" : "text-green-600"
                }`}>
                {difference > 0 ? "+" : ""}
                {difference.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                })}{" "}
                €
              </div>
            </div>
          )}

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Raison de l'ajustement
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              rows='3'
              placeholder='Expliquez la raison de cet ajustement...'
              required
            />
          </div>

          <div className='flex justify-end gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'>
              Annuler
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700'>
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
