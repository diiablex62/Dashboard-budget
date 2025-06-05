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
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
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
            totalEconomiesJusquaAujourdhui={totalEconomiesJusquaAujourdhui}
            differenceEconomiesMoisPrecedent={differenceEconomiesMoisPrecedent}
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
        <div className='w-1/2 flex justify-end items-center'>
          <button
            onClick={onUpdateBalance}
            className='flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer'>
            <AiOutlineSync className='text-lg' />
            <span>Synchroniser</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EconomieCard;
