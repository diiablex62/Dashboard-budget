/**
 * @file DepenseCard.jsx
 * @description Composant de carte pour afficher les informations de dépenses
 */

import React from "react";
import { BsCalculator } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { formatMontant } from "../../utils/calcul";
import { MONTH_NAMES } from "./dashboardConstantes";

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
  const now = new Date();

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
      {/* Tooltip des dépenses */}
      <div className='absolute bottom-4 right-4 group'>
        <AiOutlineInfoCircle className='text-gray-400 hover:text-gray-600 cursor-help text-lg' />
        <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
          <div className='whitespace-pre-line'>
            <div>
              <div className='mb-2'>
                <span className='font-semibold'>
                  Dépenses depuis le 1er du mois :
                </span>{" "}
                {formatMontant(
                  depensesClassiquesCourant +
                    recurrentsDepenseCourant +
                    echelonnesDepenseCourant
                )}
                €
              </div>
              <ul className='mb-2'>
                <li className='text-red-400'>
                  <span className='font-bold' style={{ color: "#ef4444" }}>
                    Dépenses :
                  </span>{" "}
                  {formatMontant(depensesClassiquesCourant)}€
                </li>
                <li className='text-blue-400'>
                  Paiements récurrents :{" "}
                  {formatMontant(recurrentsDepenseCourant)}€
                </li>
                <li className='text-purple-400'>
                  Paiements échelonnés :{" "}
                  {formatMontant(echelonnesDepenseCourant)}€
                </li>
              </ul>
              <div className='mb-2 mt-4'>
                <span className='font-semibold'>
                  Mois Actuel (total prévisionnel) :
                </span>{" "}
                {formatMontant(totalDepense)}€
              </div>
              <ul className='mb-2'>
                <li className='text-red-400'>
                  <span className='font-bold' style={{ color: "#ef4444" }}>
                    Dépenses :
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
                  depensesClassiquesMoisPrec +
                    recurrentsDepenseMoisPrec +
                    echelonnesDepenseMoisPrec
                )}
                €
              </div>
              <ul>
                <li className='text-red-400'>
                  <span className='font-bold' style={{ color: "#ef4444" }}>
                    Dépenses :
                  </span>{" "}
                  {formatMontant(depensesClassiquesMoisPrec)}€
                </li>
                <li className='text-blue-400'>
                  Paiements récurrents (dépense) :{" "}
                  {formatMontant(recurrentsDepenseMoisPrec)}€
                </li>
                <li className='text-purple-400'>
                  Paiements échelonnés (dépense) :{" "}
                  {formatMontant(echelonnesDepenseMoisPrec)}€
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepenseCard;
