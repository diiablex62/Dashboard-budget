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
  isPrevisionnel,
  depenseRevenu = [],
  paiementsRecurrents = [],
  paiementsEchelonnes = [],
  calculTotalEchelonnesMois = () => 0,
  isCurrentMonth = () => false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const now = new Date();
  const isMoins = differenceMoisPrecedent > 0;
  const isPlus = differenceMoisPrecedent < 0;

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      {/* Icône info dans le coin supérieur droit de la carte */}
      <div
        className='absolute top-2 right-2 z-10'
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>
        <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
        {showTooltip && (
          <TooltipDepense
            depensesClassiquesCourant={depensesClassiquesCourant}
            recurrentsDepenseCourant={recurrentsDepenseCourant}
            echelonnesDepenseCourant={echelonnesDepenseCourant}
            totalDepense={totalDepenseJusquaAujourdhui}
            depenseRevenu={depenseRevenu}
            paiementsRecurrents={paiementsRecurrents}
            paiementsEchelonnes={paiementsEchelonnes}
            depensesClassiquesMoisPrec={depensesClassiquesMoisPrec}
            recurrentsDepenseMoisPrec={recurrentsDepenseMoisPrec}
            echelonnesDepenseMoisPrec={echelonnesDepenseMoisPrec}
            calculTotalEchelonnesMois={calculTotalEchelonnesMois}
            isCurrentMonth={isCurrentMonth}
          />
        )}
      </div>
      <div className='flex items-center justify-between'>
        <div className='relative flex-1'>
          <span className='text-gray-500 font-medium'>
            {isPrevisionnel
              ? `Total prévisionnel des dépenses en ${
                  MONTH_NAMES[now.getMonth()]
                } ${now.getFullYear()}`
              : `Total dépensé actuellement en ${
                  MONTH_NAMES[now.getMonth()]
                } ${now.getFullYear()}`}
          </span>
        </div>
      </div>
      <div className='relative'>
        <div className='text-2xl font-bold dark:text-white'>
          {formatMontant(totalDepense)}€
        </div>
      </div>
      <div
        className={`text-xs font-semibold ${
          isMoins ? "text-green-600" : isPlus ? "text-red-600" : "text-gray-400"
        }`}>
        {isMoins ? "↓" : isPlus ? "↑" : ""}{" "}
        {Math.abs(differenceMoisPrecedent).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
        })}{" "}
        € {isMoins ? "de moins" : isPlus ? "de plus" : ""} que le mois dernier
      </div>
    </div>
  );
};

export default DepenseCard;
