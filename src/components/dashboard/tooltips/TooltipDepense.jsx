/**
 * @file TooltipDepense.jsx
 * @description Composant de tooltip pour afficher les détails des dépenses (contenu seul, sans icône info)
 */

import React from "react";

const TooltipDepense = ({
  depensesClassiquesCourant = 0,
  recurrentsDepenseCourant = 0,
  echelonnesDepenseCourant = 0,
  totalDepense = 0,
  depenseRevenu = [],
  paiementsRecurrents = [],
  paiementsEchelonnes = [],
  depensesClassiquesMoisPrec = 0,
  recurrentsDepenseMoisPrec = 0,
  echelonnesDepenseMoisPrec = 0,
  calculTotalEchelonnesMois = () => 0,
  isCurrentMonth = () => false,
  formatMontant = (v) =>
    Number(v).toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
}) => (
  <div className='absolute top-0 left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg z-50 shadow-lg whitespace-pre-line'>
    <div>
      <div className='mb-2'>
        <span className='font-semibold'>
          Dépenses du 1 du mois jusqu'à aujourd'hui :
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
          Paiements récurrents : {formatMontant(recurrentsDepenseCourant)}€
        </li>
        <li className='text-purple-400'>
          Paiements échelonnés : {formatMontant(calculTotalEchelonnesMois())}€
        </li>
      </ul>
      <div className='mb-2 mt-4'>
        <span className='font-semibold'>
          Total prévisionnel à la fin du mois :
        </span>{" "}
        {formatMontant(totalDepense)}€
      </div>
      <ul className='mb-2'>
        <li className='text-red-400'>
          <span className='font-bold' style={{ color: "#ef4444" }}>
            Dépenses :
          </span>{" "}
          {formatMontant(
            depenseRevenu
              .filter(
                (d) => d.type === "depense" && isCurrentMonth(new Date(d.date))
              )
              .reduce((acc, d) => acc + Math.abs(parseFloat(d.montant || 0)), 0)
          )}
          €
        </li>
        <li className='text-blue-400'>
          Paiements récurrents :{" "}
          {formatMontant(
            paiementsRecurrents
              .filter(
                (p) =>
                  p.type === "depense" &&
                  (!p.debut || new Date(p.debut) <= new Date())
              )
              .reduce((acc, p) => acc + Math.abs(parseFloat(p.montant || 0)), 0)
          )}
          €
        </li>
        <li className='text-purple-400'>
          Paiements échelonnés :{" "}
          {formatMontant(
            paiementsEchelonnes
              .filter((e) => e.type === "depense")
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
        <span className='font-semibold'>Total des dépenses du mois précédent :</span>{" "}
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
);

export default TooltipDepense;
