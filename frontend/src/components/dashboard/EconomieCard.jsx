/**
 * @file EconomieCard.jsx
 * @description Composant de carte pour afficher les informations des économies
 */

import React, { useState } from "react";
import { BsCalculator } from "react-icons/bs";
import { AiOutlineSync, AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import TooltipEconomie from "./tooltips/TooltipEconomie";

const EconomieCard = ({
  totalEconomies,
  totalEconomiesJusquaAujourdhui,
  totalEconomiesMoisPrecedent,
  differenceEconomiesMoisPrecedent,
  onUpdateBalance,
  isPrevisionnel,
  totalRevenusJusquaAujourdhui,
  totalDepenseJusquaAujourdhui,
  totalRevenus,
  totalDepense,
  totalRevenusMoisPrecedent,
  totalDepenseMoisPrecedent,
  messageSynchronisation,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative col-span-2'>
      {/* Icône info dans le coin supérieur droit de la carte */}
      <div
        className='absolute top-2 right-2 z-10'
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>
        <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
        {showTooltip && (
          <TooltipEconomie
            totalRevenusJusquaAujourdhui={totalRevenusJusquaAujourdhui}
            totalDepenseJusquaAujourdhui={totalDepenseJusquaAujourdhui}
            totalEconomiesJusquaAujourdhui={totalEconomiesJusquaAujourdhui}
            totalRevenus={totalRevenus}
            totalDepense={totalDepense}
            totalEconomies={totalEconomies}
            totalRevenusMoisPrecedent={totalRevenusMoisPrecedent}
            totalDepenseMoisPrecedent={totalDepenseMoisPrecedent}
            totalEconomiesMoisPrecedent={totalEconomiesMoisPrecedent}
          />
        )}
      </div>
      <div className='flex'>
        {/* Partie gauche : titre, montant, différence */}
        <div className='w-1/2 relative'>
          <div className='flex items-center justify-between'>
            <div className='relative flex-1'>
              <span className='text-gray-500 font-medium'>
                {isPrevisionnel
                  ? "Économies prévisionnelles"
                  : "Économies actuelles"}
              </span>
            </div>
          </div>
          <div className='relative'>
            <div className='text-2xl font-bold dark:text-white'>
              {formatMontant(totalEconomies)}€
            </div>
          </div>
          <div
            className={`text-xs font-semibold ${
              differenceEconomiesMoisPrecedent < 0
                ? "text-red-600"
                : differenceEconomiesMoisPrecedent > 0
                ? "text-green-600"
                : "text-gray-400"
            }`}>
            {differenceEconomiesMoisPrecedent < 0
              ? "↓"
              : differenceEconomiesMoisPrecedent > 0
              ? "↑"
              : ""}{" "}
            {Math.abs(differenceEconomiesMoisPrecedent).toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 2 }
            )}{" "}
            €{" "}
            {differenceEconomiesMoisPrecedent < 0
              ? "de moins"
              : differenceEconomiesMoisPrecedent > 0
              ? "de plus"
              : ""}{" "}
            que le mois dernier
          </div>
        </div>
        {/* Partie droite : bouton synchronisation */}
        <div className='w-1/2 flex flex-col justify-center items-center h-full'>
          {messageSynchronisation && (
            <div className='mb-3 text-sm text-gray-800 dark:text-gray-100 text-left font-medium max-w-xs w-full'>
              {messageSynchronisation}
            </div>
          )}
          <button
            onClick={async () => {
              setIsSyncing(true);
              await new Promise((resolve) => setTimeout(resolve, 800));
              setIsSyncing(false);
              onUpdateBalance();
            }}
            className='flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-base font-semibold shadow-md mt-0'>
            <AiOutlineSync
              className={`text-lg transition-transform duration-800 ${
                isSyncing ? "animate-spin-sync" : ""
              }`}
            />
            <span>Synchroniser</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EconomieCard;

<style jsx>{`
  .animate-spin-sync {
    animation: spin-sync 0.8s linear 1;
  }
  @keyframes spin-sync {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(720deg);
    }
  }
`}</style>;
