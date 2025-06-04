/**
 * @file DepenseCard.jsx
 * @description Composant de carte pour afficher les informations de dépenses
 */

import React, { useState } from "react";
import { BsCalculator } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { MONTH_NAMES } from "./dashboardConstantes";
import TooltipDepense from "./tooltips/TooltipDepense";

const DepenseCard = ({
  totalDepense,
  totalDepenseJusquaAujourdhui,
  totalDepenseMoisPrecedent,
  differenceMoisPrecedent,
  isHoveringCalculator,
  setIsHoveringCalculator,
  depensesClassiquesCourant,
  recurrentsDepenseCourant,
  echelonnesDepenseCourant,
  depensesClassiquesMoisPrec,
  recurrentsDepenseMoisPrec,
  echelonnesDepenseMoisPrec,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const now = new Date();

  const tooltipData = {
    depensesClassiques: depensesClassiquesCourant,
    depensesRecurrentes: recurrentsDepenseCourant,
    depensesEchelonnees: echelonnesDepenseCourant,
    total: totalDepenseJusquaAujourdhui,
  };

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      <div className='flex items-center justify-between'>
        <div className='relative flex-1'>
          {!isHoveringCalculator ? (
            <span className='text-gray-500 font-medium'>
              Total dépensé actuellement en {MONTH_NAMES[now.getMonth()]}{" "}
              {now.getFullYear()}
            </span>
          ) : (
            <span className='text-gray-500 font-medium'>
              Total des dépenses prévisionnelles du mois
            </span>
          )}
        </div>
        <button
          className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
          onMouseEnter={() => setIsHoveringCalculator(true)}
          onMouseLeave={() => setIsHoveringCalculator(false)}>
          <BsCalculator />
        </button>
      </div>
      <div className='relative'>
        {!isHoveringCalculator ? (
          <div className='text-2xl font-bold dark:text-white'>
            {formatMontant(totalDepenseJusquaAujourdhui)}€
          </div>
        ) : (
          <div className='text-2xl font-bold text-green-600'>
            {formatMontant(totalDepense)}€
          </div>
        )}
      </div>
      <div
        className={`text-xs font-semibold ${
          !isHoveringCalculator
            ? differenceMoisPrecedent < 0
              ? "text-green-600"
              : differenceMoisPrecedent > 0
              ? "text-red-600"
              : "text-gray-400"
            : totalDepense - totalDepenseMoisPrecedent < 0
            ? "text-green-600"
            : totalDepense - totalDepenseMoisPrecedent > 0
            ? "text-red-600"
            : "text-gray-400"
        }`}>
        {!isHoveringCalculator ? (
          <>
            {differenceMoisPrecedent < 0
              ? "↓"
              : differenceMoisPrecedent > 0
              ? "↑"
              : ""}{" "}
            {Math.abs(differenceMoisPrecedent).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}{" "}
            €{" "}
            {differenceMoisPrecedent < 0
              ? "de moins"
              : differenceMoisPrecedent > 0
              ? "de plus"
              : ""}{" "}
            que le mois dernier
          </>
        ) : (
          <>
            {totalDepense - totalDepenseMoisPrecedent < 0
              ? "↓"
              : totalDepense - totalDepenseMoisPrecedent > 0
              ? "↑"
              : ""}{" "}
            {Math.abs(totalDepense - totalDepenseMoisPrecedent).toLocaleString(
              "fr-FR",
              {
                minimumFractionDigits: 2,
              }
            )}{" "}
            €{" "}
            {totalDepense - totalDepenseMoisPrecedent < 0
              ? "de moins"
              : totalDepense - totalDepenseMoisPrecedent > 0
              ? "de plus"
              : ""}{" "}
            que le mois dernier
          </>
        )}
      </div>
      {/* Nouveau Tooltip des dépenses */}
      <div className='absolute bottom-4 right-4'>
        <TooltipDepense
          depensesClassiques={[]}
          depensesRecurrentes={[]}
          depensesEchelonnees={[]}
          totalDepense={0}
        />
      </div>
    </div>
  );
};

export default DepenseCard;
