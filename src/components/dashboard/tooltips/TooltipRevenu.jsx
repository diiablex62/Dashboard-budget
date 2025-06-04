/**
 * @file TooltipRevenu.jsx
 * @description Composant de tooltip pour afficher les détails des revenus (contenu seul, sans icône info)
 */

import React from "react";

const TooltipRevenu = ({
  revenusClassiquesCourant = 0,
  recurrentsRevenuCourant = 0,
  echelonnesRevenuCourant = 0,
  totalRevenus = 0,
  depenseRevenu = [],
  paiementsRecurrents = [],
  paiementsEchelonnes = [],
  revenusClassiquesMoisPrec = 0,
  recurrentsRevenuMoisPrec = 0,
  echelonnesRevenuMoisPrec = 0,
  isCurrentMonth = () => false,
  formatMontant = (v) =>
    Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
}) => (
  <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg whitespace-pre-line'>
    <div>
      <div className='mb-2'>
        <span className='font-semibold'>Revenus depuis le 1er du mois :</span>{" "}
        {formatMontant(
          revenusClassiquesCourant +
            recurrentsRevenuCourant +
            echelonnesRevenuCourant
        )}
        €
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
          Mois Actuel (total prévisionnel) :
        </span>{" "}
        {formatMontant(totalRevenus)}€
      </div>
      <ul className='mb-2'>
        <li className='text-green-400'>
          <span className='font-bold'>Revenus :</span>{" "}
          {formatMontant(
            depenseRevenu
              .filter(
                (d) => d.type === "revenu" && isCurrentMonth(new Date(d.date))
              )
              .reduce((acc, d) => acc + parseFloat(d.montant || 0), 0)
          )}
          €
        </li>
        <li className='text-blue-400'>
          Paiements récurrents :{" "}
          {formatMontant(
            paiementsRecurrents
              .filter(
                (p) =>
                  p.type === "revenu" &&
                  (!p.debut || new Date(p.debut) <= new Date())
              )
              .reduce((acc, p) => acc + parseFloat(p.montant || 0), 0)
          )}
          €
        </li>
        <li className='text-purple-400'>
          Paiements échelonnés :{" "}
          {formatMontant(
            paiementsEchelonnes
              .filter((e) => e.type === "revenu")
              .reduce(
                (acc, e) =>
                  acc +
                  Math.abs(parseFloat(e.montant || 0)) /
                    parseInt(e.mensualites || 1),
                0
              )
          )}
          €
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

export default TooltipRevenu;
