/**
 * @file DepenseCard.jsx
 * @description Composant de carte pour afficher les informations de dépenses
 */

import React, { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { MONTH_NAMES } from "./dashboardConstantes";
import TooltipDepense from "./tooltips/TooltipDepense";

const DepenseCard = ({
  totalDepense,
  totalDepenseJusquaAujourdhui,
  totalDepenseMoisPrecedent,
  differenceMoisPrecedent,
  depensesClassiquesCourant,
  recurrentsDepenseCourant,
  echelonnesDepenseCourant,
  depensesClassiquesMoisPrec,
  recurrentsDepenseMoisPrec,
  echelonnesDepenseMoisPrec,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const now = new Date();

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      <div className='flex items-center justify-between'>
        <div className='relative flex-1'>
          <span className='text-gray-500 font-medium'>
            Total dépensé actuellement en {MONTH_NAMES[now.getMonth()]}{" "}
            {now.getFullYear()}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div
            className='relative'
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}>
            <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
            {showTooltip && (
              <TooltipDepense
                depensesClassiquesCourant={depensesClassiquesCourant}
                recurrentsDepenseCourant={recurrentsDepenseCourant}
                echelonnesDepenseCourant={echelonnesDepenseCourant}
                totalDepense={totalDepenseJusquaAujourdhui}
                depenseRevenu={[]}
                paiementsRecurrents={[]}
                paiementsEchelonnes={[]}
                depensesClassiquesMoisPrec={depensesClassiquesMoisPrec}
                recurrentsDepenseMoisPrec={recurrentsDepenseMoisPrec}
                echelonnesDepenseMoisPrec={echelonnesDepenseMoisPrec}
                calculTotalEchelonnesMois={() => 0}
                isCurrentMonth={() => false}
              />
            )}
          </div>
        </div>
      </div>
      <div className='relative'>
        <div className='text-2xl font-bold dark:text-white'>
          {formatMontant(totalDepenseJusquaAujourdhui)}€
        </div>
      </div>
      <div
        className={`text-xs font-semibold ${
          differenceMoisPrecedent < 0
            ? "text-green-600"
            : differenceMoisPrecedent > 0
            ? "text-red-600"
            : "text-gray-400"
        }`}>
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
      </div>
    </div>
  );
};

export default DepenseCard;
