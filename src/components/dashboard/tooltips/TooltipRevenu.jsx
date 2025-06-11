/**
 * @file TooltipRevenu.jsx
 * @description Composant de tooltip pour afficher les détails des revenus (contenu seul, sans icône info)
 */

import React from "react";
import { formatMontant } from "../../../utils/calcul";

const TooltipRevenu = ({
  revenusClassiquesCourant,
  recurrentsRevenuCourant,
  echelonnesRevenuCourant,
  totalRevenus,
  revenusClassiquesPrevisionnel,
  recurrentsRevenuPrevisionnel,
  echelonnesRevenuPrevisionnel,
  revenusClassiquesMoisPrec,
  recurrentsRevenuMoisPrec,
  echelonnesRevenuMoisPrec,
}) => {
  return (
    <div className='absolute top-0 right-full mr-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg whitespace-pre-line'>
      <div>
        <div className='mb-2'>
          <span className='font-semibold'>
            Revenus du 1 du mois jusqu'à aujourd'hui:
          </span>{" "}
          {formatMontant(totalRevenus)}€
        </div>
        <ul className='mb-2'>
          <li className='text-green-400'>
            <span className='font-bold'>Revenus :</span>{" "}
            {formatMontant(revenusClassiquesCourant)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsRevenuCourant)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesRevenuCourant)}€
          </li>
        </ul>
        <div className='mb-2 mt-4'>
          <span className='font-semibold'>
            Total prévisionnel à la fin du mois :
          </span>{" "}
          {formatMontant(
            revenusClassiquesPrevisionnel +
              recurrentsRevenuPrevisionnel +
              echelonnesRevenuPrevisionnel
          )}
          €
        </div>
        <ul className='mb-2'>
          <li className='text-green-400'>
            <span className='font-bold'>Revenus :</span>{" "}
            {formatMontant(revenusClassiquesPrevisionnel)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsRevenuPrevisionnel)}
            €
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesRevenuPrevisionnel)}
            €
          </li>
        </ul>
        <div className='mb-2'>
          <span className='font-semibold'>
            Total des revenus du mois précédent :
          </span>{" "}
          {formatMontant(
            revenusClassiquesMoisPrec +
              recurrentsRevenuMoisPrec +
              echelonnesRevenuMoisPrec
          )}
          €
        </div>
        <ul>
          <li className='text-green-400'>
            <span className='font-bold'>Revenus :</span>{" "}
            {formatMontant(revenusClassiquesMoisPrec)}€
          </li>
          <li className='text-blue-400'>
            Paiements récurrents : {formatMontant(recurrentsRevenuMoisPrec)}€
          </li>
          <li className='text-purple-400'>
            Paiements échelonnés : {formatMontant(echelonnesRevenuMoisPrec)}€
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TooltipRevenu;
