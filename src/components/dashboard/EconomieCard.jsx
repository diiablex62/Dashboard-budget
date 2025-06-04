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
  totalEconomiesJusquaAujourdhui,
  differenceEconomiesMoisPrecedent,
  onUpdateBalance,
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
                Économies actuelles
              </span>
            </div>
          </div>
          <div className='relative'>
            <div className='text-2xl font-bold dark:text-white'>
              {formatMontant(totalEconomiesJusquaAujourdhui)}€
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
        <div className='w-1/2 flex flex-col items-start'>
          <span className='text-sm text-gray-500 font-medium mb-3'>
            Vous n'avez pas {totalEconomiesJusquaAujourdhui.toFixed(2)}€ sur
            votre compte&nbsp;?
          </span>
          <button
            onClick={onUpdateBalance}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white rounded-lg transition dark:bg-blue-500 dark:hover:bg-blue-600'>
            <AiOutlineSync className='text-lg' />
            Mettre à jour mon solde actuel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EconomieCard;
