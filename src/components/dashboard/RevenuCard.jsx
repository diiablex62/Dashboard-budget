/**
 * @file RevenuCard.jsx
 * @description Composant de carte pour afficher les informations de revenus
 */

import React, { useState } from "react";
import { BsCalculator } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { MONTH_NAMES } from "./dashboardConstantes";
import TooltipRevenu from "./tooltips/TooltipRevenu";

const RevenuCard = ({
  totalRevenus,
  totalRevenusJusquaAujourdhui,
  totalRevenusMoisPrecedent,
  differenceRevenusMoisPrecedent,
  isHoveringCalculatorRevenus,
  setIsHoveringCalculatorRevenus,
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
          {!isHoveringCalculatorRevenus ? (
            <span className='text-gray-500 font-medium'>
              Total revenus actuellement en {MONTH_NAMES[now.getMonth()]}{" "}
              {now.getFullYear()}
            </span>
          ) : (
            <span className='text-gray-500 font-medium'>
              Total des revenus prévisionnels du mois
            </span>
          )}
        </div>
        <button
          className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
          onMouseEnter={() => setIsHoveringCalculatorRevenus(true)}
          onMouseLeave={() => setIsHoveringCalculatorRevenus(false)}>
          <BsCalculator />
        </button>
      </div>
      <div className='relative'>
        {!isHoveringCalculatorRevenus ? (
          <div className='text-2xl font-bold dark:text-white'>
            {formatMontant(totalRevenusJusquaAujourdhui)}€
          </div>
        ) : (
          <div className='text-2xl font-bold text-green-600'>
            {formatMontant(totalRevenus)}€
          </div>
        )}
      </div>
      <div
        className={`text-xs font-semibold ${
          !isHoveringCalculatorRevenus
            ? differenceRevenusMoisPrecedent < 0
              ? "text-red-600"
              : differenceRevenusMoisPrecedent > 0
              ? "text-green-600"
              : "text-gray-400"
            : totalRevenus - totalRevenusMoisPrecedent < 0
            ? "text-red-600"
            : totalRevenus - totalRevenusMoisPrecedent > 0
            ? "text-green-600"
            : "text-gray-400"
        }`}>
        {!isHoveringCalculatorRevenus ? (
          <>
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
          </>
        ) : (
          <>
            {totalRevenus - totalRevenusMoisPrecedent < 0
              ? "↓"
              : totalRevenus - totalRevenusMoisPrecedent > 0
              ? "↑"
              : ""}{" "}
            {Math.abs(totalRevenus - totalRevenusMoisPrecedent).toLocaleString(
              "fr-FR",
              { minimumFractionDigits: 2 }
            )}{" "}
            €{" "}
            {totalRevenus - totalRevenusMoisPrecedent < 0
              ? "de moins"
              : totalRevenus - totalRevenusMoisPrecedent > 0
              ? "de plus"
              : ""}{" "}
            que le mois dernier
          </>
        )}
      </div>
      {/* Nouveau Tooltip des revenus */}
      <div className='absolute bottom-4 right-4 group'>
        <AiOutlineInfoCircle
          className='text-gray-400 hover:text-gray-600 cursor-help text-lg'
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <div className='absolute bottom-0 right-full mr-2 z-50'>
            <TooltipRevenu data={tooltipData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenuCard;
