/**
 * @file RevenuCard.jsx
 * @description Composant de carte pour afficher les informations de revenus
 */

import React, { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { MONTH_NAMES } from "./dashboardConstantes";
import TooltipRevenu from "./tooltips/TooltipRevenu";

const RevenuCard = ({
  totalRevenus,
  totalRevenusJusquaAujourdhui,
  totalRevenusMoisPrecedent,
  differenceRevenusMoisPrecedent,
  revenusClassiquesCourant,
  recurrentsRevenuCourant,
  echelonnesRevenuCourant,
  revenusClassiquesMoisPrec,
  recurrentsRevenuMoisPrec,
  echelonnesRevenuMoisPrec,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const now = new Date();

  const tooltipData = {
    revenusClassiques: revenusClassiquesCourant,
    revenusRecurrents: recurrentsRevenuCourant,
    revenusEchelonnes: echelonnesRevenuCourant,
    total: totalRevenusJusquaAujourdhui,
  };

  return (
    <div className='bg-white dark:bg-transparent dark:border dark:border-gray-700 rounded-xl shadow p-6 flex flex-col gap-2 relative'>
      <div className='flex items-center justify-between'>
        <div className='relative flex-1'>
          <span className='text-gray-500 font-medium'>
            Total revenus actuellement en {MONTH_NAMES[now.getMonth()]}{" "}
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
              <TooltipRevenu
                revenusClassiquesCourant={revenusClassiquesCourant}
                recurrentsRevenuCourant={recurrentsRevenuCourant}
                echelonnesRevenuCourant={echelonnesRevenuCourant}
                totalRevenus={totalRevenusJusquaAujourdhui}
                depenseRevenu={[]}
                paiementsRecurrents={[]}
                paiementsEchelonnes={[]}
                revenusClassiquesMoisPrec={revenusClassiquesMoisPrec}
                recurrentsRevenuMoisPrec={recurrentsRevenuMoisPrec}
                echelonnesRevenuMoisPrec={echelonnesRevenuMoisPrec}
              />
            )}
          </div>
        </div>
      </div>
      <div className='relative'>
        <div className='text-2xl font-bold dark:text-white'>
          {formatMontant(totalRevenusJusquaAujourdhui)}€
        </div>
      </div>
      <div
        className={`text-xs font-semibold ${
          differenceRevenusMoisPrecedent < 0
            ? "text-red-600"
            : differenceRevenusMoisPrecedent > 0
            ? "text-green-600"
            : "text-gray-400"
        }`}>
        {differenceRevenusMoisPrecedent < 0
          ? "↓"
          : differenceRevenusMoisPrecedent > 0
          ? "↑"
          : ""}{" "}
        {Math.abs(differenceRevenusMoisPrecedent).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
        })}{" "}
        €{" "}
        {differenceRevenusMoisPrecedent < 0
          ? "de moins"
          : differenceRevenusMoisPrecedent > 0
          ? "de plus"
          : ""}{" "}
        que le mois dernier
      </div>
    </div>
  );
};

export default RevenuCard;
