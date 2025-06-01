import React from "react";
import { useBalance } from "../../context/BalanceContext";
import { formatMontant } from "../../utils/calcul";

export default function BalanceHistory() {
  const { getBalanceHistory } = useBalance();
  const adjustments = getBalanceHistory();

  if (adjustments.length === 0) {
    return (
      <div className='text-center py-4 text-gray-500 dark:text-gray-400'>
        Aucun ajustement de solde n'a été effectué
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {adjustments.map((adjustment, index) => (
        <div
          key={index}
          className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex justify-between items-start mb-2'>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {new Date(adjustment.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div
              className={`text-sm font-semibold ${
                adjustment.difference > 0
                  ? "text-red-600"
                  : adjustment.difference < 0
                  ? "text-green-600"
                  : "text-gray-600 dark:text-gray-400"
              }`}>
              {adjustment.difference > 0 ? "+" : ""}
              <div className='text-sm font-medium'>
                {formatMontant(adjustment.difference)}€
              </div>
            </div>
          </div>

          <div className='flex justify-between items-center mb-2'>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Ancien solde
            </div>
            <div className='text-sm font-medium dark:text-white'>
              <div className='text-sm font-medium'>
                {formatMontant(adjustment.previousAmount)}€
              </div>
            </div>
          </div>

          <div className='flex justify-between items-center mb-2'>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Nouveau solde
            </div>
            <div className='text-sm font-medium dark:text-white'>
              <div className='text-sm font-medium'>
                {formatMontant(adjustment.newAmount)}€
              </div>
            </div>
          </div>

          <div className='mt-2 pt-2 border-t border-gray-200 dark:border-gray-700'>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Raison
            </div>
            <div className='text-sm dark:text-white mt-1'>
              {adjustment.reason}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
