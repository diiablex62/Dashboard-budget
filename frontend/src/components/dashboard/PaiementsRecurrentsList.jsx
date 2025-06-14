/**
 * @file PaiementsRecurrentsList.jsx
 * @description Composant pour afficher la liste des paiements récurrents
 */

import React from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";

const PaiementsRecurrentsList = ({ paiements, onViewAll }) => {
  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col'>
      <div className='font-semibold mb-4'>Paiements récurrents récents</div>
      <div className='flex flex-col gap-2 mb-4'>
        {paiements.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2 dark:bg-black dark:text-white'>
            <div className='flex items-center gap-3'>
              <span className='bg-blue-100 text-blue-600 rounded-full p-2'>
                <AiOutlineCalendar />
              </span>
              <div>
                <div className='font-medium'>{item.nom}</div>
                <div className='text-xs text-gray-400'>
                  {item.frequence} -{" "}
                  {item.jourPrelevement
                    ? `Prélèvement : le ${item.jourPrelevement}`
                    : (() => {
                        try {
                          const date = new Date(item.date);
                          return date.toLocaleDateString("fr-FR");
                        } catch {
                          return "Date invalide";
                        }
                      })()}
                </div>
              </div>
            </div>
            <div className='font-semibold'>{formatMontant(item.montant)}€</div>
          </div>
        ))}
      </div>
      <button
        className='w-full border border-gray-200 text-gray-800 bg-white hover:bg-gray-100 rounded-lg py-2 text-sm font-semibold transition dark:border-gray-700 dark:text-white dark:bg-transparent dark:hover:bg-gray-800 cursor-pointer'
        onClick={onViewAll}>
        Voir tous les paiements récurrents
      </button>
    </div>
  );
};

export default PaiementsRecurrentsList;
