/**
 * @file RevenuCard.jsx
 * @description Composant de carte pour afficher les informations de revenus
 */

import React from "react";
import { BsCalculator } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { MONTH_NAMES } from "./dashboardConstantes";

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
  const now = new Date();

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
      {/* Tooltip des revenus */}
      <div className='absolute bottom-4 right-4 group'>
        <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
        <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
          <div className='whitespace-pre-line'>
            <div>
              <div className='mb-2'>
                <span className='font-semibold'>
                  Revenus depuis le 1er du mois :
                </span>{" "}
                {formatMontant(
                  revenusClassiquesCourant +
                    recurrentsRevenuCourant +
                    echelonnesRevenuCourant
                )}
                €
              </div>
              <ul className='mb-2'>
                <li className='text-green-400'>
                  <span className='font-bold' style={{ color: "#22c55e" }}>
                    Revenus :
                  </span>{" "}
                  {formatMontant(revenusClassiquesCourant)}€
                </li>
                <li className='text-blue-400'>
                  Paiements récurrents :{" "}
                  {formatMontant(recurrentsRevenuCourant)}€
                </li>
                <li className='text-purple-400'>
                  Paiements échelonnés :{" "}
                  {formatMontant(echelonnesRevenuCourant)}€
                </li>
              </ul>
              <div className='mb-2 mt-4'>
                <span className='font-semibold'>
                  Mois Actuel (total prévisionnel) :
                </span>{" "}
                {formatMontant(totalRevenus)}€
              </div>
              <ul className='mb-2'>
                <li className='text-green-400'>
                  <span className='font-bold' style={{ color: "#22c55e" }}>
                    Revenus :
                  </span>{" "}
                  {formatMontant(0)}€
                </li>
                <li className='text-blue-400'>
                  Paiements récurrents : {formatMontant(0)}€
                </li>
                <li className='text-purple-400'>
                  Paiements échelonnés : {formatMontant(0)}€
                </li>
              </ul>
              <div className='mb-2'>
                <span className='font-semibold'>Mois précédent :</span>{" "}
                {formatMontant(
                  revenusClassiquesMoisPrec +
                    recurrentsRevenuMoisPrec +
                    echelonnesRevenuMoisPrec
                )}
                €
              </div>
              <ul>
                <li className='text-green-400'>
                  <span className='font-bold' style={{ color: "#22c55e" }}>
                    Revenus :
                  </span>{" "}
                  {formatMontant(revenusClassiquesMoisPrec)}€
                </li>
                <li className='text-blue-400'>
                  Paiements récurrents (revenu) :{" "}
                  {formatMontant(recurrentsRevenuMoisPrec)}€
                </li>
                <li className='text-purple-400'>
                  Paiements échelonnés (revenu) :{" "}
                  {formatMontant(echelonnesRevenuMoisPrec)}€
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuCard;
